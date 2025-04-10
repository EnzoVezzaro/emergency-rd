import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

// Define a key for localStorage
const SETTINGS_STORAGE_KEY = 'appSettings';

// Define the structure for settings
interface AppSettings {
  aiProvider: string;
  aiModel: string;
  apiKey: string;
  language: string;
  theme: string;
}

const SettingsPage = () => {
  const { toast } = useToast();

  // --- State for Settings with initial defaults ---
  const [settings, setSettings] = useState<AppSettings>({
    aiProvider: 'Google',
    aiModel: '',
    apiKey: '',
    language: 'es',
    theme: 'light',
  });

  // --- Load settings from localStorage on component mount ---
  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge stored settings with defaults to handle missing keys
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        console.log('Loaded settings from localStorage:', parsedSettings);
      } catch (error) {
        console.error("Failed to parse settings from localStorage:", error);
        // Optionally clear corrupted storage
        // localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Handle input changes ---
  const handleInputChange = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));

    // --- Apply theme change immediately ---
    if (field === 'theme') {
      applyTheme(value);
    }
  };

  // --- Function to apply theme class ---
  const applyTheme = (themeValue: string) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeValue);
    console.log(`Applied theme: ${themeValue}`);
  };

  // --- Save settings to localStorage ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Don't save the actual API key to localStorage in a real app for security
      // This is just for demonstration. Use secure storage or backend instead.
      const settingsToSave = { ...settings };
      // Mask API key before logging/saving if needed for demo purposes
      // console.log('Saving settings:', { ...settingsToSave, apiKey: '***' });

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved to local storage.",
      });
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
      toast({
        title: "Error Saving Settings",
        description: "Could not save settings to local storage.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto"> {/* Added max-width and centering */}
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* AI Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure the AI provider for OCR and other tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="ai-provider" className="md:text-right">Provider</Label>
                <Select
                  value={settings.aiProvider}
                  onValueChange={(value) => handleInputChange('aiProvider', value)}
                >
                  <SelectTrigger id="ai-provider" className="col-span-2">
                    <SelectValue placeholder="Select AI Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="OpenAI">OpenAI</SelectItem>
                    <SelectItem value="OpenRouter">OpenRouter</SelectItem>
                    <SelectItem value="Grok">Grok</SelectItem>
                    <SelectItem value="xAI">xAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="ai-model" className="md:text-right">Model</Label>
                <Input
                  id="ai-model"
                  value={settings.aiModel}
                  onChange={(e) => handleInputChange('aiModel', e.target.value)}
                  placeholder="e.g., gemini-pro-vision, gpt-4o"
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="api-key" className="md:text-right">API Key</Label>
                <Input
                  id="api-key"
                  type="password" // Use password type for masking
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your API Key (stored locally)"
                  className="col-span-2"
                />
                 <p className="text-xs text-muted-foreground col-span-2 md:col-start-2">Note: API keys are stored in your browser's local storage. Do not use production keys.</p>
              </div>
            </CardContent>
          </Card>

          {/* Language Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>Set the default language for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="language" className="md:text-right">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  <SelectTrigger id="language" className="col-span-2">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    {/* Add other languages as needed */}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose the application theme.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) => handleInputChange('theme', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">Dark</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4"> {/* Added padding top */}
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
