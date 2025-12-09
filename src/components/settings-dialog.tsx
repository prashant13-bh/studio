'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { decryptData, encryptData } from '@/lib/security/crypto.service';
import { toast } from 'sonner';
import { KeyRound, Shield, Eye, EyeOff } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export default function SettingsDialog({ isOpen, onClose, onSave }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKeyData = localStorage.getItem('gravity_api_key');
      setIsKeySaved(!!savedKeyData);
      setApiKey('');
      setPassword('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiKey || !password) {
      toast.error('Both API Key and Master Password are required.');
      return;
    }
    setIsLoading(true);
    try {
      const encryptedKey = await encryptData(apiKey, password);
      localStorage.setItem('gravity_api_key', encryptedKey);
      toast.success('API Key saved securely!');
      onSave(apiKey);
    } catch (error) {
      toast.error('Failed to save API Key.', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!password) {
      toast.error('Master Password is required to load the key.');
      return;
    }
    setIsLoading(true);
    try {
      const encryptedKey = localStorage.getItem('gravity_api_key');
      if (!encryptedKey) {
        toast.error('No API Key found in storage.');
        return;
      }
      const decryptedKey = await decryptData(encryptedKey, password);
      toast.success('API Key loaded successfully!');
      onSave(decryptedKey);
    } catch (error) {
      toast.error('Failed to load API Key.', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            {isKeySaved
              ? 'Enter your Master Password to unlock your saved API key.'
              : "Set your API key and a Master Password to encrypt it. Your key is stored securely on your device and never sent to our servers."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isKeySaved && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key" className="text-right">
                <KeyRound className="inline-block h-4 w-4 mr-1" />
                API Key
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                  placeholder="Enter your AI provider API key"
                />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              <Shield className="inline-block h-4 w-4 mr-1" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="Your master password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {isKeySaved ? (
            <Button onClick={handleLoad} disabled={isLoading}>
              {isLoading ? 'Unlocking...' : 'Unlock Key'}
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save & Encrypt'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
