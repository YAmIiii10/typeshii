import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { DataCleaning } from '@/components/DataCleaning';
import { ImageOCR } from '@/components/ImageOCR';
import { AIChat } from '@/components/AIChat';
import { Card } from '@/components/ui/card';
import { Database, Image, Sparkles, MessageSquare, BarChart3 } from 'lucide-react';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');

  const handleDataLoad = (newData: any[], newFilename: string, newFileType: string) => {
    setData(newData);
    setFilename(newFilename);
    setFileType(newFileType);
  };

  const handleImageLoad = (file: File) => {
    setImageFile(file);
  };

  const handleTextExtracted = (text: string, parsedData: any[]) => {
    setExtractedText(text);
    if (parsedData.length > 0) {
      setData(parsedData);
      setFilename(`${imageFile?.name || 'extracted'}_data`);
      setFileType('ocr');
    }
  };

  const handleDataCleaned = (cleanedData: any[]) => {
    setData(cleanedData);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-chart-primary to-chart-secondary bg-clip-text text-transparent">
            DataMind AI Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your data, clean it with AI, and get intelligent insights
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="data" disabled={data.length === 0} className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="clean" disabled={data.length === 0} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Clean</span>
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">OCR</span>
            </TabsTrigger>
            <TabsTrigger value="ai" disabled={data.length === 0} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <FileUpload onDataLoad={handleDataLoad} onImageLoad={handleImageLoad} />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {data.length > 0 ? (
              <DataTable data={data} filename={filename} type={fileType} />
            ) : (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No data loaded. Please upload a file first.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="clean" className="space-y-6">
            {data.length > 0 ? (
              <DataCleaning data={data} onDataCleaned={handleDataCleaned} />
            ) : (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No data to clean. Please upload a file first.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ocr" className="space-y-6">
            <ImageOCR imageFile={imageFile} onTextExtracted={handleTextExtracted} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {data.length > 0 ? (
              <AIChat data={data} filename={filename} />
            ) : (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No data for AI analysis. Please upload a file first.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;