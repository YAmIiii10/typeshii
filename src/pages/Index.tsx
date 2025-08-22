import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataCleaningProps {
  data: any[];
  onDataCleaned: (cleanedData: any[]) => void;
}

export const DataCleaning = ({ data, onDataCleaned }: DataCleaningProps) => {
  const [cleaningOptions, setCleaningOptions] = useState({
    removeEmptyRows: true,
    trimWhitespace: true,
    removeSpecialChars: false,
    standardizeText: true,
    removeDuplicates: true,
    handleMissingValues: true
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cleaningStats, setCleaningStats] = useState<any>(null);
  const { toast } = useToast();

  const analyzeDataQuality = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const stats = {
        totalRows: data.length,
        emptyRows: data.filter(row => Object.values(row).every(val => !val || String(val).trim() === '')).length,
        duplicateRows: data.length - new Set(data.map(row => JSON.stringify(row))).size,
        whitespaceIssues: data.reduce((count, row) => 
          count + Object.values(row).filter(val => 
            typeof val === 'string' && (val.startsWith(' ') || val.endsWith(' '))
          ).length, 0
        ),
        missingValues: data.reduce((count, row) => 
          count + Object.values(row).filter(val => val === null || val === undefined || val === '').length, 0
        )
      };
      
      setCleaningStats(stats);
      setIsAnalyzing(false);
    }, 1500);
  };

  const cleanData = () => {
    let cleaned = [...data];
    let changes = 0;
    let operationsPerformed = [];

    if (cleaningOptions.removeEmptyRows) {
      const before = cleaned.length;
      cleaned = cleaned.filter(row => 
        !Object.values(row).every(val => !val || String(val).trim() === '')
      );
      const removed = before - cleaned.length;
      changes += removed;
      if (removed > 0) operationsPerformed.push(`Removed ${removed} empty rows`);
    }

    if (cleaningOptions.removeDuplicates) {
      const before = cleaned.length;
      const seen = new Set();
      cleaned = cleaned.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const removed = before - cleaned.length;
      changes += removed;
      if (removed > 0) operationsPerformed.push(`Removed ${removed} duplicate rows`);
    }

    if (cleaningOptions.trimWhitespace || cleaningOptions.standardizeText || cleaningOptions.removeSpecialChars) {
      let cellsModified = 0;
      cleaned = cleaned.map(row => {
        const newRow = { ...row };
        Object.keys(newRow).forEach(key => {
          if (typeof newRow[key] === 'string') {
            const originalValue = newRow[key];
            
            if (cleaningOptions.trimWhitespace) {
              newRow[key] = newRow[key].trim();
            }
            
            if (cleaningOptions.standardizeText) {
              newRow[key] = newRow[key].replace(/\s+/g, ' ');
            }
            
            if (cleaningOptions.removeSpecialChars) {
              // Essential characters to preserve: letters, numbers, spaces, commas, periods, @, hyphens, underscores
              // Remove special characters but preserve essential ones
              let cleanedValue = newRow[key].replace(/[^\w\s,.\-@]/g, '');
              
              // Remove duplicate essential characters (but keep at least one)
              // Remove duplicate spaces
              cleanedValue = cleanedValue.replace(/\s{2,}/g, ' ');
              // Remove duplicate commas
              cleanedValue = cleanedValue.replace(/,{2,}/g, ',');
              // Remove duplicate periods
              cleanedValue = cleanedValue.replace(/\.{2,}/g, '.');
              // Remove duplicate @ symbols
              cleanedValue = cleanedValue.replace(/@{2,}/g, '@');
              // Remove duplicate hyphens
              cleanedValue = cleanedValue.replace(/-{2,}/g, '-');
              // Remove duplicate underscores
              cleanedValue = cleanedValue.replace(/_{2,}/g, '_');
              
              newRow[key] = cleanedValue;
            }
            
            if (originalValue !== newRow[key]) {
              cellsModified++;
            }
          }
        });
        return newRow;
      });
      
      if (cleaningOptions.trimWhitespace && cellsModified > 0) {
        operationsPerformed.push(`Trimmed whitespace in ${cellsModified} cells`);
      }
      if (cleaningOptions.standardizeText && cellsModified > 0) {
        operationsPerformed.push(`Standardized text spacing`);
      }
      if (cleaningOptions.removeSpecialChars && cellsModified > 0) {
        operationsPerformed.push(`Cleaned special characters in ${cellsModified} cells`);
      }
    }

    if (cleaningOptions.handleMissingValues) {
      let missingValuesHandled = 0;
      cleaned = cleaned.map(row => {
        const newRow = { ...row };
        Object.keys(newRow).forEach(key => {
          if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
            newRow[key] = 'N/A';
            missingValuesHandled++;
          }
        });
        return newRow;
      });
      if (missingValuesHandled > 0) {
        operationsPerformed.push(`Handled ${missingValuesHandled} missing values`);
      }
    }

    onDataCleaned(cleaned);
    toast({
      title: "Data Cleaned Successfully!",
      description: operationsPerformed.length > 0 
        ? operationsPerformed.join('. ') + '.'
        : `Processed ${data.length} rows with selected cleaning options.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="floating-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-chart-primary" />
            Data Quality Analysis
          </CardTitle>
          <CardDescription>
            Analyze and clean your dataset to improve data quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!cleaningStats && (
            <div className="text-center py-8">
              <Button 
                onClick={analyzeDataQuality} 
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-chart-primary to-chart-secondary hover:opacity-90"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Data Quality'}
              </Button>
              {isAnalyzing && (
                <div className="mt-4 space-y-2">
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-muted-foreground">Scanning for data quality issues...</p>
                </div>
              )}
            </div>
          )}

          {cleaningStats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-background to-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-chart-primary">{cleaningStats.totalRows}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-background to-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-chart-warning">{cleaningStats.emptyRows}</div>
                  <div className="text-sm text-muted-foreground">Empty Rows</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-background to-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-chart-secondary">{cleaningStats.duplicateRows}</div>
                  <div className="text-sm text-muted-foreground">Duplicates</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-background to-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-chart-tertiary">{cleaningStats.missingValues}</div>
                  <div className="text-sm text-muted-foreground">Missing Values</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Cleaning Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    removeEmptyRows: 'Remove Empty Rows',
                    trimWhitespace: 'Trim Whitespace',
                    standardizeText: 'Standardize Text Spacing',
                    removeDuplicates: 'Remove Duplicate Rows',
                    handleMissingValues: 'Handle Missing Values',
                    removeSpecialChars: 'Remove Special Characters'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={key}
                        checked={cleaningOptions[key as keyof typeof cleaningOptions]}
                        onCheckedChange={(checked) =>
                          setCleaningOptions(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={cleanData}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Clean Data
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};