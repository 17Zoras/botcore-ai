import { useState, useEffect } from "react";
import { 
  Phone, Flashlight, Volume2, Share2, MapPin, MessageSquare, Shield, BookOpen, Bell, Timer, Vibrate, Info, Play, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";

const Tools = () => {
  const { settings, updateSettings } = useSettings();
  const { addNotification } = useNotifications();

  const [flashlightOn, setFlashlightOn] = useState(false);
  const [sirenOn, setSirenOn] = useState(false);

  // Safe Walk Timer State
  const [safeWalkOpen, setSafeWalkOpen] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Fake Call State
  const [fakeCallOpen, setFakeCallOpen] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [callerName, setCallerName] = useState("Mom");
  const [callDelay, setCallDelay] = useState(5);

  const [resourceOpen, setResourceOpen] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
    } else if (timeRemaining === 0 && timerActive) {
      setTimerActive(false);
      toast.error("⚠️ Check-in time expired!", { description: "We're alerting your emergency contacts", duration: 10000 });
      addNotification.mutate({ type: "alert", title: "Safe Walk Expired", message: "Check-in time expired. Emergency contacts have been alerted." });
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const handleFakeCall = () => {
    setFakeCallOpen(false);
    toast.info(`📞 Incoming call in ${callDelay} seconds...`);
    setTimeout(() => setFakeCallActive(true), callDelay * 1000);
  };

  const handleAnswerCall = () => { setFakeCallActive(false); toast.success("Call connected"); };
  const handleDeclineCall = () => { setFakeCallActive(false); };
  const handleFlashlight = () => { setFlashlightOn(!flashlightOn); toast.success(flashlightOn ? "Flashlight off" : "🔦 Flashlight on"); };
  const handleSiren = () => { setSirenOn(!sirenOn); if (!sirenOn) toast.success("🔊 Siren activated!"); };

  const handleShareLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      if (navigator.share) {
        navigator.share({ title: "My Location", text: "I am sharing my current location", url }).catch(() => {
          navigator.clipboard.writeText(url);
          toast.success("📍 Location link copied!");
        });
      } else {
        navigator.clipboard.writeText(url);
        toast.success("📍 Location link copied!");
      }
    }, () => toast.error("Unable to get location"));
  };

  const startSafeWalk = () => {
    setTimeRemaining(timerMinutes * 60);
    setTimerActive(true);
    setSafeWalkOpen(false);
    toast.success(`🚶‍♀️ Safe Walk started! Check in within ${timerMinutes} minutes`);
    addNotification.mutate({ type: "info", title: "Safe Walk Started", message: `Timer set for ${timerMinutes} minutes.` });
  };

  const checkIn = () => {
    setTimerActive(false);
    setTimeRemaining(0);
    toast.success("✅ Check-in successful!");
    addNotification.mutate({ type: "success", title: "Safe Walk Check-In", message: "You confirmed you're safe." });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const quickTools = [
    { icon: Phone, label: "Fake Call", description: "Simulate incoming call", color: "text-primary", bgColor: "bg-primary/10", action: () => setFakeCallOpen(true) },
    { icon: Flashlight, label: "Flashlight", description: flashlightOn ? "Strobe active" : "SOS strobe mode", color: flashlightOn ? "text-warning" : "text-muted-foreground", bgColor: flashlightOn ? "bg-warning/20" : "bg-muted", action: handleFlashlight },
    { icon: Volume2, label: "Siren", description: sirenOn ? "Playing loud alarm" : "Loud attention alert", color: sirenOn ? "text-sos" : "text-muted-foreground", bgColor: sirenOn ? "bg-sos/20" : "bg-muted", action: handleSiren },
    { icon: Share2, label: "Share Location", description: "Send to anyone", color: "text-safe", bgColor: "bg-safe/10", action: handleShareLocation },
  ];

  const resources = [
    { icon: BookOpen, label: "Safety Guide", description: "Tips for staying safe", content: "Our comprehensive safety guide covers personal safety awareness, safe travel tips, digital privacy protection, and emergency preparedness." },
    { icon: MapPin, label: "Safe Places", description: "Find nearby help", content: "Safe places include police stations, fire stations, hospitals, 24-hour stores, and well-lit public areas." },
    { icon: MessageSquare, label: "Crisis Chat", description: "24/7 support available", content: "Crisis support:\n• National Crisis Line: 988\n• Crisis Text Line: Text HOME to 741741\n• National DV Hotline: 1-800-799-7233" },
    { icon: Shield, label: "Self Defense", description: "Basic techniques", content: "Basic self-defense:\n1. Maintain distance\n2. Use your voice loudly\n3. Target vulnerable areas\n4. Create opportunities to escape" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-foreground">Safety Tools</h1><p className="text-muted-foreground">Quick access safety features</p></div>

        {timerActive && (
          <Card className="gradient-card shadow-card border-0 border-l-4 border-l-primary animate-pulse-slow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><Timer className="w-5 h-5 text-primary" /><span className="font-semibold text-foreground">Safe Walk Active</span></div>
                <span className="text-2xl font-bold text-primary">{formatTime(timeRemaining)}</span>
              </div>
              <Progress value={(timeRemaining / (timerMinutes * 60)) * 100} className="mb-3" />
              <div className="flex gap-2">
                <Button onClick={checkIn} className="flex-1">I'm Safe - Check In</Button>
                <Button variant="outline" onClick={() => { setTimerActive(false); setTimeRemaining(0); }}><X className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="gradient-card shadow-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Quick Tools</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickTools.map(tool => (
                <Button key={tool.label} variant="ghost" className="h-auto py-4 px-4 flex flex-col items-center gap-2 bg-muted/50 hover:bg-muted rounded-xl" onClick={tool.action}>
                  <div className={`w-12 h-12 rounded-full ${tool.bgColor} flex items-center justify-center`}><tool.icon className={`w-6 h-6 ${tool.color}`} /></div>
                  <div className="text-center"><p className="font-medium text-foreground">{tool.label}</p><p className="text-xs text-muted-foreground">{tool.description}</p></div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {!timerActive && (
          <Card className="gradient-card shadow-card border-0 bg-gradient-to-r from-primary/5 to-safe/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Timer className="w-7 h-7 text-primary" /></div>
                <div className="flex-1"><h3 className="font-semibold text-foreground">Safe Walk Timer</h3><p className="text-sm text-muted-foreground">Set a timer for your journey.</p></div>
                <Button onClick={() => setSafeWalkOpen(true)}>Start</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="gradient-card shadow-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Auto Features</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Vibrate className="w-5 h-5 text-muted-foreground" /></div>
                <div><Label className="font-medium">Shake to Alert</Label><p className="text-xs text-muted-foreground">Shake phone to send SOS</p></div>
              </div>
              <Switch checked={settings?.shake_to_alert ?? true} onCheckedChange={c => updateSettings.mutate({ shake_to_alert: c })} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Bell className="w-5 h-5 text-muted-foreground" /></div>
                <div><Label className="font-medium">Auto Recording</Label><p className="text-xs text-muted-foreground">Record audio during SOS</p></div>
              </div>
              <Switch checked={settings?.auto_recording ?? false} onCheckedChange={c => updateSettings.mutate({ auto_recording: c })} />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Safety Resources</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {resources.map(r => (
              <Button key={r.label} variant="ghost" className="w-full justify-start h-auto py-3 px-3 hover:bg-muted/50 rounded-xl" onClick={() => setResourceOpen(r.label)}>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mr-3"><r.icon className="w-5 h-5 text-muted-foreground" /></div>
                <div className="text-left"><p className="font-medium text-foreground">{r.label}</p><p className="text-xs text-muted-foreground">{r.description}</p></div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card border-0 bg-sos/5 border-l-4 border-l-sos">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Emergency Numbers</h3>
            <div className="space-y-2">
              {[{ num: "112", label: "Emergency", color: "text-sos" }, { num: "988", label: "Crisis Line", color: "text-primary" }, { num: "18007997233", label: "DV Hotline", color: "text-safe", display: "1-800-799-7233" }].map(n => (
                <Button key={n.num} variant="ghost" className="w-full justify-between" onClick={() => window.location.href = `tel:${n.num}`}>
                  <div className="flex items-center gap-2"><Phone className={`w-4 h-4 ${n.color}`} /><span>{n.display || n.num} - {n.label}</span></div>
                  <span className={`${n.color} font-bold`}>Call</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={safeWalkOpen} onOpenChange={setSafeWalkOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Start Safe Walk Timer</DialogTitle><DialogDescription>Set how long until you should check in.</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2"><Label>Timer Duration (minutes)</Label>
              <div className="flex gap-2">{[5, 10, 15, 30, 60].map(m => <Button key={m} variant={timerMinutes === m ? "default" : "outline"} size="sm" onClick={() => setTimerMinutes(m)}>{m}</Button>)}</div>
            </div>
            <Button onClick={startSafeWalk} className="w-full"><Play className="w-4 h-4 mr-2" />Start {timerMinutes} Minute Timer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={fakeCallOpen} onOpenChange={setFakeCallOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Up Fake Call</DialogTitle><DialogDescription>Configure your fake incoming call.</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2"><Label>Caller Name</Label><Input value={callerName} onChange={e => setCallerName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Call in (seconds)</Label>
              <div className="flex gap-2">{[5, 10, 30, 60].map(s => <Button key={s} variant={callDelay === s ? "default" : "outline"} size="sm" onClick={() => setCallDelay(s)}>{s}s</Button>)}</div>
            </div>
            <Button onClick={handleFakeCall} className="w-full"><Phone className="w-4 h-4 mr-2" />Schedule Fake Call</Button>
          </div>
        </DialogContent>
      </Dialog>

      {fakeCallActive && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse"><Phone className="w-12 h-12 text-primary" /></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{callerName}</h2>
          <p className="text-muted-foreground mb-12">Incoming Call...</p>
          <div className="flex gap-8">
            <Button onClick={handleDeclineCall} size="lg" className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90"><X className="w-8 h-8" /></Button>
            <Button onClick={handleAnswerCall} size="lg" className="w-16 h-16 rounded-full bg-safe hover:bg-safe/90"><Phone className="w-8 h-8" /></Button>
          </div>
        </div>
      )}

      {resources.map(r => (
        <Dialog key={r.label} open={resourceOpen === r.label} onOpenChange={() => setResourceOpen(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{r.label}</DialogTitle></DialogHeader>
            <p className="text-muted-foreground whitespace-pre-line">{r.content}</p>
          </DialogContent>
        </Dialog>
      ))}
    </Layout>
  );
};

export default Tools;
