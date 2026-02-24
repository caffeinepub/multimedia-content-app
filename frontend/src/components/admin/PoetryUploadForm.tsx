import { useState } from 'react';
import { useCreatePoetry } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';

export default function PoetryUploadForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createPoetry = useCreatePoetry();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setImageFile(file);
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
      let imageBlob: ExternalBlob | undefined;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createPoetry.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        image: imageBlob,
      });

      toast.success('Poetry uploaded successfully!');
      setTitle('');
      setContent('');
      setImageFile(null);
      setUploadProgress(0);

      const fileInput = document.getElementById('poetry-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload poetry. Please try again.');
    }
  };

  const isUploading = createPoetry.isPending;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Poetry</CardTitle>
        <CardDescription>Share beautiful verses with the community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="poetry-title">Title *</Label>
            <Input
              id="poetry-title"
              placeholder="Enter poetry title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="urdu-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poetry-content">Content *</Label>
            <Textarea
              id="poetry-content"
              placeholder="Enter poetry content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isUploading}
              rows={6}
              className="urdu-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poetry-image">Image (Optional)</Label>
            <Input
              id="poetry-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
            />
            {imageFile && (
              <p className="text-sm text-muted-foreground">Selected: {imageFile.name}</p>
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
                Upload Poetry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
