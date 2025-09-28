import { useState, useRef } from "react";
import { 
  Phone, 
  Link2, 
  Plus, 
  X, 
  Check, 
  Copy, 
  Clock,
  UserCheck,
  ArrowLeft
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "framer-motion";

interface InviteData {
  id: string;
  phoneNumber: string;
  name?: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
}

interface EnsembleInviteFlowProps {
  ensembleName?: string;
  onClose?: () => void;
  onComplete?: (inviteData: { phoneNumbers: string[]; message?: string }) => void;
}

const mockRecentInvites: InviteData[] = [
  {
    id: '1',
    phoneNumber: '+1 (555) 123-4567',
    name: 'Sarah Martinez',
    status: 'accepted',
    sentAt: '2 days ago'
  },
  {
    id: '2',
    phoneNumber: '+1 (555) 987-6543',
    name: 'Mike Johnson',
    status: 'pending',
    sentAt: '1 day ago'
  },
  {
    id: '3',
    phoneNumber: '+1 (555) 456-7890',
    status: 'pending',
    sentAt: '3 hours ago'
  }
];

export function EnsembleInviteFlow({ 
  ensembleName = "Summer Indie Band",
  onClose,
  onComplete 
}: EnsembleInviteFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<'phone' | 'link' | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [currentPhoneInput, setCurrentPhoneInput] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sentInvites, setSentInvites] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const inviteLink = `https://coretel.app/join/${ensembleName.toLowerCase().replace(/\s+/g, '-')}`;

  const isValidPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const handleAddPhoneNumber = () => {
    if (isValidPhoneNumber(currentPhoneInput) && !phoneNumbers.includes(currentPhoneInput)) {
      setPhoneNumbers([...phoneNumbers, currentPhoneInput]);
      setCurrentPhoneInput('');
      phoneInputRef.current?.focus();
    }
  };

  const handleRemovePhoneNumber = (phoneToRemove: string) => {
    setPhoneNumbers(phoneNumbers.filter(phone => phone !== phoneToRemove));
  };

  const handlePhoneInputChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setCurrentPhoneInput(formatted);
  };

  const handlePhoneInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidPhoneNumber(currentPhoneInput)) {
      handleAddPhoneNumber();
    }
  };

  const handleSendInvites = () => {
    setSentInvites([...phoneNumbers]);
    setCurrentScreen(3);
    
    if (onComplete) {
      onComplete({
        phoneNumbers,
        message: inviteMessage || undefined
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const handleBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const getStatusBadge = (status: InviteData['status']) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-accent-green text-white">Accepted</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-rdio-secondary">Pending</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        {currentScreen > 1 && (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-rdio-secondary" />
          </button>
        )}
        <div className="flex-1">
          <h1 style={{ fontSize: '24px', fontWeight: '600' }}>
            {currentScreen === 1 && 'Invite Band Members'}
            {currentScreen === 2 && selectedMethod === 'phone' && 'Invite by Phone'}
            {currentScreen === 2 && selectedMethod === 'link' && 'Share Invite Link'}
            {currentScreen === 3 && 'Invites Sent!'}
          </h1>
          <p className="text-rdio-secondary caption">
            {ensembleName}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-rdio-secondary" />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Screen 1 - Invite Options */}
          {currentScreen === 1 && (
            <motion.div
              key="screen1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto px-6 py-8 space-y-8"
            >
              {/* Invite Method Cards */}
              <div className="grid gap-4">
                <Card 
                  onClick={() => {
                    setSelectedMethod('phone');
                    setCurrentScreen(2);
                  }}
                  className="p-6 cursor-pointer hover:shadow-card transition-all border-2 hover:border-rdio-primary group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rdio-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">Invite by Phone</h4>
                      <p className="caption text-rdio-secondary">
                        Send direct invites to phone numbers
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card 
                  onClick={() => {
                    setSelectedMethod('link');
                    setCurrentScreen(2);
                  }}
                  className="p-6 cursor-pointer hover:shadow-card transition-all border-2 hover:border-rdio-primary group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-teal rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Link2 size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">Share Invite Link</h4>
                      <p className="caption text-rdio-secondary">
                        Copy a shareable link to your band
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Invites */}
              <div>
                <h3 className="mb-4">Recent Invites</h3>
                <Card className="bg-white rounded-lg shadow-subtle overflow-hidden">
                  {mockRecentInvites.map((invite, index) => (
                    <div key={invite.id}>
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {invite.status === 'accepted' ? (
                            <UserCheck size={16} className="text-accent-green" />
                          ) : (
                            <Clock size={16} className="text-rdio-secondary" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {invite.name || invite.phoneNumber}
                          </p>
                          <p className="caption text-rdio-secondary">
                            {invite.name ? invite.phoneNumber : `Sent ${invite.sentAt}`}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(invite.status)}
                          <p className="caption text-rdio-secondary">
                            {invite.sentAt}
                          </p>
                        </div>
                      </div>
                      
                      {index < mockRecentInvites.length - 1 && (
                        <Separator className="ml-14" />
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            </motion.div>
          )}

          {/* Screen 2 - Phone Invite */}
          {currentScreen === 2 && selectedMethod === 'phone' && (
            <motion.div
              key="screen2-phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto px-6 py-8 space-y-8"
            >
              {/* Phone Number Input */}
              <div>
                <label className="input-label">Add Phone Numbers</label>
                <div className="flex gap-3 mb-4">
                  <Input
                    ref={phoneInputRef}
                    value={currentPhoneInput}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    onKeyPress={handlePhoneInputKeyPress}
                    placeholder="(555) 123-4567"
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    onClick={handleAddPhoneNumber}
                    disabled={!isValidPhoneNumber(currentPhoneInput)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                {/* Phone Number Chips */}
                {phoneNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {phoneNumbers.map((phone, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2"
                      >
                        <span className="caption">{phone}</span>
                        <button
                          onClick={() => handleRemovePhoneNumber(phone)}
                          className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div>
                <label className="input-label">
                  Add Message <span className="text-rdio-secondary caption">(optional)</span>
                </label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hey! I'd love for you to join our band on CoreTet..."
                  rows={4}
                />
                <p className="caption text-rdio-secondary mt-2">
                  {inviteMessage.length}/200 characters
                </p>
              </div>

              {/* Send Button */}
              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={handleSendInvites}
                  disabled={phoneNumbers.length === 0}
                  className="w-full"
                  style={{ fontSize: '18px', height: '52px' }}
                >
                  Send {phoneNumbers.length} Invite{phoneNumbers.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Screen 2 - Link Share */}
          {currentScreen === 2 && selectedMethod === 'link' && (
            <motion.div
              key="screen2-link"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto px-6 py-8 space-y-8"
            >
              {/* Link Preview */}
              <Card className="p-6 bg-gray-50">
                <h4 className="mb-4">Your Invite Link</h4>
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                  <p className="flex-1 font-mono text-sm text-rdio-secondary break-all">
                    {inviteLink}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleCopyLink}
                  >
                    {linkCopied ? (
                      <>
                        <Check size={16} className="mr-2 text-accent-green" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="caption text-rdio-secondary mt-3">
                  Anyone with this link can request to join {ensembleName}
                </p>
              </Card>

              {/* Share Options */}
              <div>
                <h4 className="mb-4">Share Via</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="p-6 h-auto flex-col gap-2 rounded-lg"
                    onClick={() => window.open(`sms:?body=Join my band "${ensembleName}" on CoreTet: ${inviteLink}`, '_blank')}
                  >
                    <Phone size={24} />
                    <span>Text Message</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="p-6 h-auto flex-col gap-2 rounded-lg"
                    onClick={() => window.open(`mailto:?subject=Join my band on CoreTet&body=I'd like to invite you to join "${ensembleName}" on CoreTet: ${inviteLink}`, '_blank')}
                  >
                    <Link2 size={24} />
                    <span>Email</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Screen 3 - Success State */}
          {currentScreen === 3 && (
            <motion.div
              key="screen3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto px-6 py-8 space-y-8 text-center"
            >
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-rdio-primary rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                >
                  <Check size={40} className="text-white" />
                </motion.div>
              </motion.div>

              <div>
                <h2 className="mb-3">Invites Sent!</h2>
                <p className="text-rdio-secondary mb-8">
                  We've sent {sentInvites.length} invitation{sentInvites.length !== 1 ? 's' : ''} to join {ensembleName}
                </p>
              </div>

              {/* Sent Invites List */}
              <Card className="bg-white rounded-lg shadow-subtle overflow-hidden text-left">
                <div className="p-4 bg-gray-50 border-b">
                  <h4>Sent Invitations</h4>
                </div>
                {sentInvites.map((phone, index) => (
                  <div key={index}>
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center">
                        <Clock size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{phone}</p>
                        <p className="caption text-rdio-secondary">
                          Invite sent • Pending response
                        </p>
                      </div>
                      <Badge variant="outline" className="text-rdio-secondary">
                        Pending
                      </Badge>
                    </div>
                    {index < sentInvites.length - 1 && (
                      <Separator className="ml-16" />
                    )}
                  </div>
                ))}
              </Card>

              {/* Done Button */}
              <Button
                onClick={onClose}
                className="w-full bg-rdio-primary hover:bg-primary-hover text-white rounded-button py-4"
                style={{ fontSize: '18px' }}
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}