import { useState } from 'react';
import { useCreateDua } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';

export default function DuaUploadForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createDua = useCreateDua();

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploadProgress(0);

    try {
      let audioBlob: ExternalBlob | undefined;

      if (audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        audioBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createDua.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        audio: audioBlob,
      });

      toast.success('Dua uploaded successfully!');
      setTitle('');
      setContent('');
      setAudioFile(null);
      setUploadProgress(0);

      const fileInput = document.getElementById('dua-audio') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload dua. Please try again.');
    }
  };

  const isUploading = createDua.isPending;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Dua</CardTitle>
        <CardDescription>Share spiritual prayers with the community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dua-title">Title *</Label>
            <Input
              id="dua-title"
              placeholder="Enter dua title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="urdu-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dua-content">Content *</Label>
            <Textarea
              id="dua-content"
              placeholder="Enter dua content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isUploading}
              rows={6}
              className="urdu-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dua-audio">Audio (Optional)</Label>
            <Input
              id="dua-audio"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              disabled={isUploading}
            />
            {audioFile && (
              <p className="text-sm text-muted-foreground">Selected: {audioFile.name}</p>
            )}
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Dua
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
