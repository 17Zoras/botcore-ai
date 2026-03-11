import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  User, Mail, Phone, Shield, Bell, Moon, Globe, Lock, HelpCircle, LogOut, ChevronRight, Camera, Heart, FileText, Check, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { settings, isLoading: settingsLoading, updateSettings } = useSettings();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isMedicalEditing, setIsMedicalEditing] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "" });
  const [medicalForm, setMedicalForm] = useState({ blood_type: "", allergies: "", medical_conditions: "" });

  const startEditProfile = () => {
    if (profile) {
      setEditForm({ full_name: profile.full_name, email: profile.email, phone: profile.phone });
    }
    setIsEditing(true);
  };

  const startEditMedical = () => {
    if (profile) {
      setMedicalForm({ blood_type: profile.blood_type, allergies: profile.allergies, medical_conditions: profile.medical_conditions });
    }
    setIsMedicalEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(editForm);
    setIsEditing(false);
  };

  const handleMedicalSave = () => {
    updateProfile.mutate(medicalForm);
    setIsMedicalEditing(false);
  };

  const handleDarkModeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    updateSettings.mutate({ theme: checked ? "dark" : "light" });
  };

  const handleNotificationsChange = (checked: boolean) => {
    updateSettings.mutate({ notifications_enabled: checked });
    toast.success(checked ? "Notifications enabled" : "Notifications disabled");
  };

  const handleLanguageChange = (lang: string) => {
    updateSettings.mutate({ language: lang });
    const langNames: Record<string, string> = { en: "English", es: "Spanish", fr: "French", de: "German", zh: "Chinese" };
    toast.success(`Language changed to ${langNames[lang]}`);
    setLanguageDialogOpen(false);
  };

  const handleLogout = async () => {
    setLogoutDialogOpen(false);
    await signOut();
    navigate("/auth");
  };

  const languages = [
    { code: "en", name: "English (US)" }, { code: "es", name: "Español" },
    { code: "fr", name: "Français" }, { code: "de", name: "Deutsch" }, { code: "zh", name: "中文" },
  ];

  const helpTopics = [
    { title: "How to use SOS", description: "Tap the SOS button to instantly alert your emergency contacts with your location." },
    { title: "Adding contacts", description: "Go to Contacts tab and tap 'Add' to add emergency contacts who will be notified." },
    { title: "Safe Walk Timer", description: "Set a timer when traveling. If you don't check in, your contacts are alerted." },
    { title: "Privacy & Data", description: "Your location is only shared during emergencies or when you explicitly share it." },
  ];

  if (profileLoading || settingsLoading) {
    return <Layout><div className="space-y-4 p-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="gradient-card shadow-card border-0 overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 to-secondary/20" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold text-foreground">{profile?.full_name || "User"}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => isEditing ? setIsEditing(false) : startEditProfile()}>
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        {isEditing && (
          <Card className="gradient-card shadow-card border-0">
            <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Edit Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full" disabled={updateProfile.isPending}>
                <Check className="w-4 h-4 mr-2" />{updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Medical Info */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2"><Heart className="w-5 h-5 text-sos" />Medical Information</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => isMedicalEditing ? setIsMedicalEditing(false) : startEditMedical()}>
                {isMedicalEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isMedicalEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Blood Type</Label>
                  <Select value={medicalForm.blood_type} onValueChange={v => setMedicalForm({ ...medicalForm, blood_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                    <SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Allergies</Label><Input value={medicalForm.allergies} onChange={e => setMedicalForm({ ...medicalForm, allergies: e.target.value })} /></div>
                <div className="space-y-2"><Label>Medical Conditions</Label><Input value={medicalForm.medical_conditions} onChange={e => setMedicalForm({ ...medicalForm, medical_conditions: e.target.value })} /></div>
                <Button onClick={handleMedicalSave} className="w-full" disabled={updateProfile.isPending}>
                  <Check className="w-4 h-4 mr-2" />Save Medical Info
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50"><p className="text-xs text-muted-foreground">Blood Type</p><p className="font-semibold text-foreground">{profile?.blood_type || "Not set"}</p></div>
                  <div className="p-3 rounded-xl bg-muted/50"><p className="text-xs text-muted-foreground">Allergies</p><p className="font-semibold text-foreground">{profile?.allergies || "None"}</p></div>
                </div>
                <div className="p-3 rounded-xl bg-muted/50"><p className="text-xs text-muted-foreground">Medical Conditions</p><p className="font-semibold text-foreground">{profile?.medical_conditions || "None"}</p></div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Settings</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Bell className="w-5 h-5 text-muted-foreground" /></div>
                <div><p className="font-medium text-foreground">Notifications</p><p className="text-xs text-muted-foreground">Push & SMS alerts</p></div>
              </div>
              <Switch checked={settings?.notifications_enabled ?? true} onCheckedChange={handleNotificationsChange} />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Moon className="w-5 h-5 text-muted-foreground" /></div>
                <div><p className="font-medium text-foreground">Dark Mode</p><p className="text-xs text-muted-foreground">Reduce eye strain</p></div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={handleDarkModeChange} />
            </div>
            <Separator />
            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/30 rounded-lg transition-colors" onClick={() => setLanguageDialogOpen(true)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Globe className="w-5 h-5 text-muted-foreground" /></div>
                <div className="text-left"><p className="font-medium text-foreground">Language</p>
                  <p className="text-xs text-muted-foreground">{languages.find(l => l.code === (settings?.language ?? "en"))?.name}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <Separator />
            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/30 rounded-lg transition-colors" onClick={() => setPrivacyDialogOpen(true)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Lock className="w-5 h-5 text-muted-foreground" /></div>
                <div className="text-left"><p className="font-medium text-foreground">Privacy</p><p className="text-xs text-muted-foreground">Manage your data</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="gradient-card shadow-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Support</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/30 rounded-lg transition-colors" onClick={() => setHelpDialogOpen(true)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><HelpCircle className="w-5 h-5 text-muted-foreground" /></div>
                <div className="text-left"><p className="font-medium text-foreground">Help Center</p><p className="text-xs text-muted-foreground">FAQs and guides</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setLogoutDialogOpen(true)}>
          <LogOut className="w-4 h-4 mr-2" />Sign Out
        </Button>

        <p className="text-center text-xs text-muted-foreground pb-4">SafeHer v1.0.0 • Made with 💜 for your safety</p>
      </div>

      {/* Dialogs */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Help Center</DialogTitle><DialogDescription>Frequently asked questions</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-2">
            {helpTopics.map((topic, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/50">
                <p className="font-medium text-foreground">{topic.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Select Language</DialogTitle></DialogHeader>
          <div className="space-y-2 pt-2">
            {languages.map(lang => (
              <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${(settings?.language ?? "en") === lang.code ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
                <span className="font-medium">{lang.name}</span>
                {(settings?.language ?? "en") === lang.code && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Privacy Settings</DialogTitle><DialogDescription>Control how your data is used</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-muted/50"><p className="font-medium text-foreground">Location Data</p><p className="text-sm text-muted-foreground">Your location is only shared during active SOS alerts</p></div>
            <div className="p-3 rounded-xl bg-muted/50"><p className="font-medium text-foreground">Contact Information</p><p className="text-sm text-muted-foreground">Stored securely and never shared with third parties</p></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sign Out</DialogTitle><DialogDescription>Are you sure you want to sign out?</DialogDescription></DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleLogout}>Sign Out</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
