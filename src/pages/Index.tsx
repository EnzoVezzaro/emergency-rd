
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-2">Emergency Response System</h1>
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          Emergency response system connecting families with loved ones during crisis events
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card className="border-2 border-primary-100 hover:border-primary transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Smartphone className="mr-2 h-6 w-6" />
              Mobile App
            </CardTitle>
            <CardDescription>
              For families and citizens seeking information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                Find hospitals receiving patients
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                Search for loved ones by name
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                View donation needs and opportunities
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-primary-100 text-primary rounded-full p-1 text-xs">✓</span>
                Get real-time emergency updates
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/hospitals">Open Mobile App</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 border-gray-100 hover:border-gray-300 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <LayoutDashboard className="mr-2 h-6 w-6" />
              Admin Dashboard
            </CardTitle>
            <CardDescription>
              For emergency responders and hospital staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                Upload and process patient lists
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                Update hospital status and capacity
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                Manage crisis events and resources
              </li>
              <li className="flex items-center">
                <span className="mr-2 bg-gray-100 text-gray-700 rounded-full p-1 text-xs">✓</span>
                Create and distribute alerts
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">Access Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© 2025 Emergency Response System. All rights reserved.</p>
        <p className="mt-1">Helping communities stay connected during emergencies.</p>
      </footer>
    </div>
  );
};

export default Index;
