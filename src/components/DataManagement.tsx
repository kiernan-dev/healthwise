import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { dataExportService } from '@/services/dataExportService';

export const DataManagement = () => {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    stats?: { symptoms: number; sessions: number };
  }>({ type: null, message: '' });

  const [isImporting, setIsImporting] = useState(false);
  const [stats, setStats] = useState(dataExportService.getExportStats());

  // Function to refresh stats
  const refreshStats = () => {
    setStats(dataExportService.getExportStats());
  };

  const handleExport = () => {
    try {
      dataExportService.downloadExport();
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to export data. Please try again.'
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImport called');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File selected:', file.name);

    setIsImporting(true);
    setImportStatus({ type: null, message: '' });

    const result = await dataExportService.importData(file);
    
    setImportStatus({
      type: result.success ? 'success' : 'error',
      message: result.message,
      stats: result.stats
    });

    // Refresh stats and reload page if import was successful
    if (result.success) {
      refreshStats();
      // Force page reload to refresh all components with new data
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Give user time to see success message
    }

    setIsImporting(false);
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export your health data for backup or import previous data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Data Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.symptoms}</div>
              <div className="text-sm text-muted-foreground">Symptoms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.sessions}</div>
              <div className="text-sm text-muted-foreground">Chat Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalMessages}</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Export Data</h3>
            <p className="text-sm text-muted-foreground">
              Download all your health data as a JSON file for backup or transfer to another device.
            </p>
            <Button onClick={handleExport} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Import Data</h3>
            <p className="text-sm text-muted-foreground">
              Restore your health data from a previous export file.
            </p>
            
            <Label htmlFor="import-file" className="cursor-pointer">
              <Button variant="outline" className="w-full" disabled={isImporting} asChild>
                <div>
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Select Backup File'}
                </div>
              </Button>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </Label>
          </div>

          {/* Status Messages */}
          {importStatus.type && (
            <Alert className={importStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {importStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={importStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {importStatus.message}
                {importStatus.stats && (
                  <div className="mt-2 text-sm">
                    Imported: {importStatus.stats.symptoms} symptoms, {importStatus.stats.sessions} chat sessions
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};