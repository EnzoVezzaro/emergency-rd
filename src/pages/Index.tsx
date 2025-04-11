import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, LayoutDashboard } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
// Removed unused motion import

const Index = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 flex flex-col items-center justify-center">
        <img src="/logo.png" alt="Logo" style={{ width: 150, height: 'auto' }} />
        <h1 className="text-4xl font-bold text-primary-900 mb-2">{t('index.title')}</h1>
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          {t('index.subtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card className="border-2 border-primary-100 hover:border-primary transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Smartphone className="mr-2 h-6 w-6" />
              {t('index.cards.mobile.title')}
            </CardTitle>
            <CardDescription>
              {t('index.cards.mobile.description')}
            </CardDescription>
          </CardHeader> 
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                {t('index.cards.mobile.feature1')}
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                {t('index.cards.mobile.feature2')}
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                {t('index.cards.mobile.feature3')}
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                {t('index.cards.mobile.feature4')}
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/hospitals">{t('index.cards.mobile.button')}</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 border-gray-100 hover:border-gray-300 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <LayoutDashboard className="mr-2 h-6 w-6" />
              {t('index.cards.admin.title')}
            </CardTitle>
            <CardDescription>
              {t('index.cards.admin.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                {t('index.cards.admin.feature1')}
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                {t('index.cards.admin.feature2')}
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                {t('index.cards.admin.feature3')}
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                {t('index.cards.admin.feature4')}
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">{t('index.cards.admin.button')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button asChild>
          <a href="/site.webmanifest" download="manifest.webmanifest">{t('index.downloadPWA')}</a>
        </Button>
      </div>
      
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>{t('index.footer.copyright')}</p>
        <p className="mt-1">{t('index.footer.tagline')}</p>
      </footer>
    </div>
  );
};

export default Index;
