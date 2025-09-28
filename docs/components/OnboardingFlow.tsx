import { useState, useRef, useEffect } from "react";
import { ChevronDown, Upload, Users, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";

interface OnboardingFlowProps {
  onComplete?: (userData: {
    phoneNumber: string;
    name: string;
    avatar?: string;
    choice: 'join' | 'form';
  }) => void;
}

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [userName, setUserName] = useState('');
  const [userChoice, setUserChoice] = useState<'join' | 'form' | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer for resend code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const isValidPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '').length >= 10;
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    
    setPhoneNumber(formatted);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Auto-advance to next screen when complete
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      setTimeout(() => {
        setCurrentScreen(4);
      }, 500);
    }
  };

  const handleCodeBackspace = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    setIsResending(true);
    setResendTimer(30);
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
    }, 2000);
  };

  const handleAvatarUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      // In a real app, you'd upload this to your server
      console.log('Avatar uploaded:', file.name);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        phoneNumber: `${countryCode} ${phoneNumber}`,
        name: userName,
        choice: userChoice || 'join'
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white z-50 flex flex-col"
      style={{ 
        width: '375px',
        height: '812px',
        margin: '0 auto',
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)'
      }}
    >
      {/* Screen 1 - Welcome */}
      {currentScreen === 1 && (
        <div className="flex flex-col items-center justify-between h-full px-8 py-16">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Logo */}
            <div className="w-24 h-24 bg-rdio-primary rounded-full flex items-center justify-center mb-12">
              <span 
                className="text-white font-medium"
                style={{ fontSize: '32px' }}
              >
                CT
              </span>
            </div>
            
            {/* Welcome Text */}
            <h1 
              className="mb-6"
              style={{ 
                fontSize: '40px',
                fontWeight: '100',
                lineHeight: '1.2',
                color: 'var(--text-primary)'
              }}
            >
              Welcome to CoreTet
            </h1>
            
            <p 
              className="text-rdio-secondary max-w-sm mb-4"
              style={{ 
                fontSize: '18px',
                lineHeight: '1.5'
              }}
            >
              Collaboration for Bands
            </p>
            
            <p 
              className="text-rdio-secondary max-w-sm"
              style={{ 
                fontSize: '14px',
                lineHeight: '1.4',
                fontStyle: 'italic'
              }}
            >
              So easy, a drummer can do it
            </p>
          </div>
          
          {/* Get Started Button */}
          <Button
            variant="primary"
            onClick={() => setCurrentScreen(2)}
            className="w-full"
            style={{ fontSize: '18px', height: '52px' }}
          >
            Get Started
          </Button>
        </div>
      )}

      {/* Screen 2 - Phone Auth */}
      {currentScreen === 2 && (
        <div className="flex flex-col h-full px-8 py-16">
          <div className="flex-1">
            <h2 
              className="mb-8 text-center"
              style={{ 
                fontSize: '32px',
                fontWeight: '300',
                color: 'var(--text-primary)'
              }}
            >
              Enter your phone number
            </h2>
            
            <div className="space-y-6">
              {/* Country Code + Phone Input */}
              <div className="flex gap-3">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-24 focus:border-rdio-primary focus:ring-rdio-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="flex-1"
                  style={{ fontSize: '18px' }}
                />
              </div>
              
              <p className="text-rdio-secondary text-center">
                We'll text you a verification code
              </p>
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setCurrentScreen(3)}
            disabled={!isValidPhoneNumber(phoneNumber)}
            className="w-full"
            style={{ fontSize: '18px', height: '52px' }}
          >
            Continue
          </Button>
        </div>
      )}

      {/* Screen 3 - Verify */}
      {currentScreen === 3 && (
        <div className="flex flex-col h-full px-8 py-16">
          <div className="flex-1">
            <h2 
              className="mb-4 text-center"
              style={{ 
                fontSize: '32px',
                fontWeight: '300',
                color: 'var(--text-primary)'
              }}
            >
              Enter verification code
            </h2>
            
            <p className="text-rdio-secondary text-center mb-12">
              Sent to {countryCode} {phoneNumber}
            </p>
            
            {/* 6-digit Code Input */}
            <div className="flex justify-center gap-3 mb-8">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (codeInputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeBackspace(index, e)}
                  className="w-12 h-16 text-center border-2 border-gray-200 rounded-lg focus:border-rdio-primary focus:outline-none transition-colors"
                  style={{ 
                    fontSize: '24px',
                    fontWeight: '600'
                  }}
                  maxLength={1}
                />
              ))}
            </div>
            
            {/* Resend Code */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-rdio-secondary">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-rdio-primary hover:underline disabled:opacity-50"
                  style={{ fontSize: '16px' }}
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 4 - Profile Setup */}
      {currentScreen === 4 && (
        <div className="flex flex-col h-full px-8 py-16">
          <div className="flex-1">
            <h2 
              className="mb-8 text-center"
              style={{ 
                fontSize: '32px',
                fontWeight: '300',
                color: 'var(--text-primary)'
              }}
            >
              Almost done!
            </h2>
            
            <div className="space-y-8">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
                  >
                    <Upload size={24} className="text-rdio-secondary" />
                  </div>
                  <p className="text-center mt-2 caption text-rdio-secondary">
                    Optional photo
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleAvatarUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Name Input */}
              <div>
                <label className="input-label">Your Name</label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  style={{ fontSize: '18px' }}
                />
              </div>
              
              {/* Ensemble Options */}
              <div className="space-y-4">
                <p className="font-medium">What would you like to do?</p>
                
                <div className="space-y-3">
                  <Card 
                    onClick={() => setUserChoice('join')}
                    className={`p-6 cursor-pointer transition-all ${
                      userChoice === 'join' 
                        ? 'border-rdio-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rdio-primary rounded-lg flex items-center justify-center">
                        <Users size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1">Join a Band</h4>
                        <p className="caption text-rdio-secondary">
                          Connect with existing bands and collaborators
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card 
                    onClick={() => setUserChoice('form')}
                    className={`p-6 cursor-pointer transition-all ${
                      userChoice === 'form' 
                        ? 'border-rdio-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent-teal rounded-lg flex items-center justify-center">
                        <Plus size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1">Form a Band</h4>
                        <p className="caption text-rdio-secondary">
                          Start your own collaborative music project
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={!userName.trim() || !userChoice}
            className="w-full"
            style={{ fontSize: '18px', height: '52px' }}
          >
            Complete Setup
          </Button>
        </div>
      )}
    </div>
  );
}