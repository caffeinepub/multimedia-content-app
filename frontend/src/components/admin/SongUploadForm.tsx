import { useState } from 'react';
import { useCreateSong } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';

export default function SongUploadForm() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createSong = useCreateSong();

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file (MP3, WAV, OGG, AAC, etc.)');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !artist.trim() || !audioFile) {
      toast.error('Please fill in all required fields and select an audio file');
      return;
    }

    setUploadProgress(0);

    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const audioBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createSong.mutateAsync({
        title: title.trim(),
        artist: artist.trim(),
        audio: audioBlob,
      });

      toast.success('Song uploaded successfully!');
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setUploadProgress(0);

      const fileInput = document.getElementById('song-audio') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload song. Please try again.');
    }
  };

  const isUploading = createSong.isPending;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Song</CardTitle>
        <CardDescription>Share relaxing melodies with the community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="song-title">Title *</Label>
            <Input
              id="song-title"
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="urdu-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="song-artist">Artist *</Label>
            <Input
              id="song-artist"
              placeholder="Enter artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={isUploading}
              className="urdu-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="song-audio">Audio File * (MP3, WAV, OGG, AAC, FLAC)</Label>
            {/* 
              Using explicit MIME types to open the device file manager/music library
              instead of the voice recorder on mobile devices.
              No `capture` attribute is set intentionally.
            */}
            <Input
              id="song-audio"
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/flac,audio/x-m4a,audio/mp4,audio/webm,audio/*"
              onChange={handleAudioChange}
              disabled={isUploading}
            />
            {audioFile ? (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Music className="h-3 w-3" />
                Selected: {audioFile.name}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Browse your device's music library to select an audio file
              </p>
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
                Upload Song
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
