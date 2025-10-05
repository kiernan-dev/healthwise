import { chatStorageService, ChatSession } from './chatStorageService';
import { symptomStorageService, SymptomEntry } from './symptomStorageService';

export interface ExportData {
  version: string;
  exportDate: string;
  symptoms: SymptomEntry[];
  chatSessions: ChatSession[];
}

class DataExportService {
  private version = '1.0.0';

  exportData(): ExportData {
    const symptoms = symptomStorageService.getSymptoms();
    const chatSessions = chatStorageService.getAllSessions();

    return {
      version: this.version,
      exportDate: new Date().toISOString(),
      symptoms,
      chatSessions
    };
  }

  downloadExport(): void {
    const data = this.exportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthwise-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  async importData(file: File): Promise<{ success: boolean; message: string; stats?: { symptoms: number; sessions: number } }> {
    console.log('Import started with file:', file.name, 'size:', file.size);
    try {
      const text = await file.text();
      console.log('File text length:', text.length);
      const data: ExportData = JSON.parse(text);
      console.log('Parsed data:', { symptoms: data.symptoms?.length, sessions: data.chatSessions?.length });

      // Validate data structure
      if (!this.validateImportData(data)) {
        return {
          success: false,
          message: 'Invalid file format. Please select a valid HealthWise backup file.'
        };
      }

      // Clear existing data (with confirmation handled by UI)
      symptomStorageService.clearAllSymptoms();
      chatStorageService.clearAllSessions();

      // Import data using proper service methods
      symptomStorageService.importSymptoms(data.symptoms);
      chatStorageService.importSessions(data.chatSessions);

      // Debug: verify data was actually written
      console.log('Import verification:');
      console.log('- Symptoms in storage:', symptomStorageService.getSymptoms().length);
      console.log('- Sessions in storage:', chatStorageService.getAllSessions().length);
      console.log('- localStorage symptoms:', localStorage.getItem('health-assistant-symptoms'));
      console.log('- localStorage chats:', localStorage.getItem('health-assistant-chats'));

      return {
        success: true,
        message: 'Data imported successfully!',
        stats: {
          symptoms: data.symptoms.length,
          sessions: data.chatSessions.length
        }
      };

    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: 'Failed to import data. Please check the file format and try again.'
      };
    }
  }

  private validateImportData(data: unknown): data is ExportData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'version' in data &&
      'exportDate' in data &&
      'symptoms' in data &&
      'chatSessions' in data &&
      typeof (data as Record<string, unknown>).version === 'string' &&
      typeof (data as Record<string, unknown>).exportDate === 'string' &&
      Array.isArray((data as Record<string, unknown>).symptoms) &&
      Array.isArray((data as Record<string, unknown>).chatSessions)
    );
  }

  getExportStats(): { symptoms: number; sessions: number; totalMessages: number } {
    const symptoms = symptomStorageService.getSymptoms();
    const sessions = chatStorageService.getAllSessions();
    const totalMessages = sessions.reduce((total, session) => total + session.messages.length, 0);

    return {
      symptoms: symptoms.length,
      sessions: sessions.length,
      totalMessages
    };
  }
}

export const dataExportService = new DataExportService();