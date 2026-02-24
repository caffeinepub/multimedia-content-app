import PINAuthGuard from '../components/PINAuthGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PoetryUploadForm from '../components/admin/PoetryUploadForm';
import DuaUploadForm from '../components/admin/DuaUploadForm';
import SongUploadForm from '../components/admin/SongUploadForm';
import ContentManagement from '../components/admin/ContentManagement';
import UsersControlsPanel from '../components/admin/UsersControlsPanel';
import { Upload, Settings, Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <PINAuthGuard>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage your spiritual content</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Settings className="h-4 w-4" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users & Controls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6 mt-8">
            <Tabs defaultValue="poetry" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="poetry">Poetry</TabsTrigger>
                <TabsTrigger value="dua">Dua</TabsTrigger>
                <TabsTrigger value="song">Song</TabsTrigger>
              </TabsList>

              <TabsContent value="poetry" className="mt-6">
                <PoetryUploadForm />
              </TabsContent>

              <TabsContent value="dua" className="mt-6">
                <DuaUploadForm />
              </TabsContent>

              <TabsContent value="song" className="mt-6">
                <SongUploadForm />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="manage" className="mt-8">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-8">
            <UsersControlsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </PINAuthGuard>
  );
}
