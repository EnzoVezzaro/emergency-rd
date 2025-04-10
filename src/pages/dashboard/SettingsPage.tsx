import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/context/I18nContext'; // Import the i18n hook

// Define a key for localStorage
const SETTINGS_STORAGE_KEY = 'appSettings';

// Define the structure for settings
interface AppSettings {
  aiProvider: string;
  aiModel: string;
  apiKey: string;
  // language: string; // Removed: Managed by I18nContext
  theme: string;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const { t, language: currentLanguage, setLanguage } = useI18n(); // Use the i18n hook

  // --- State for Settings with initial defaults ---
  // State now primarily reflects the UI interaction, actual language is managed by I18nContext
  const [settings, setSettings] = useState<Omit<AppSettings, 'language'>>({
    aiProvider: 'Google',
    aiModel: '',
    apiKey: '',
    // language: 'es', // Removed: Use currentLanguage from context
    theme: 'light',
  });

  // --- Load settings from localStorage on component mount (excluding language) ---
  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        // Load all settings EXCEPT language, which is handled by I18nProvider
        const { language, ...otherSettings } = parsedSettings;
        setSettings(prev => ({ ...prev, ...otherSettings }));
        console.log('Loaded non-language settings from localStorage:', otherSettings);
        // Apply theme if loaded
        if (parsedSettings.theme) {
           applyTheme(parsedSettings.theme);
        }
      } catch (error) {
        console.error("Failed to parse settings from localStorage:", error);
      }
    }
    // No need to sync language select here anymore, it uses currentLanguage directly
  }, []); // Run only once on mount


  // --- Handle input changes (excluding language) ---
  const handleInputChange = (field: Exclude<keyof AppSettings, 'language'>, value: string) => {
    // Update local component state for UI feedback
    setSettings(prev => ({ ...prev, [field]: value }));

    // --- Apply theme change immediately ---
    if (field === 'theme') {
      applyTheme(value); // Apply theme class change
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
      // Language changes are handled immediately via the Select component
      toast({
        title: t('settingsSaved'), // Use translation key
        description: t('settingsSavedDescription'), // Use translation key
      });
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
      toast({
        title: t('errorSavingSettings'), // Use translation key
        description: t('errorSavingSettingsDescription'), // Use translation key
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* AI Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('aiConfig')}</CardTitle>
              <CardDescription>{t('aiConfigDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="ai-provider" className="md:text-right">{t('provider')}</Label>
                <Select
                  value={settings.aiProvider}
                  onValueChange={(value) => handleInputChange('aiProvider', value)}
                > 
                  <SelectTrigger id="ai-provider" className="col-span-2">
                    <SelectValue placeholder={t('selectProvider')} />
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
                <Label htmlFor="ai-model" className="md:text-right">{t('model')}</Label>
                <Input
                  id="ai-model"
                  value={settings.aiModel}
                  onChange={(e) => handleInputChange('aiModel', e.target.value)}
                  placeholder={t('modelPlaceholder')}
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="api-key" className="md:text-right">{t('apiKey')}</Label>
                <Input
                  id="api-key"
                  type="password" // Use password type for masking
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder={t('apiKeyPlaceholder')}
                  className="col-span-2"
                />
                 <p className="text-xs text-muted-foreground col-span-2 md:col-start-2">{t('apiKeyNote')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Language Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('languageRegion')}</CardTitle>
              <CardDescription>{t('languageRegionDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="language" className="md:text-right">{t('language')}</Label>
                <Select
                  value={currentLanguage} // Use current language from context directly
                  onValueChange={(value) => setLanguage(value)} // Call context setter directly
                >
                  <SelectTrigger id="language" className="col-span-2">
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">{t('spanish')}</SelectItem>
                    <SelectItem value="en">{t('english')}</SelectItem>
                    {/* Add other languages as needed */}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance')}</CardTitle>
              <CardDescription>{t('appearanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) => handleInputChange('theme', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">{t('light')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">{t('dark')}</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit">{t('saveSettings')}</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
