import { useState } from "react";
import { Phone, Plus, User, Users, Heart, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { useContacts } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";

const Contacts = () => {
  const { contacts, isLoading, addContact, deleteContact, setPrimary } = useContacts();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "Family" });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    addContact.mutate(
      { ...newContact, is_primary: contacts.length === 0 },
      { onSuccess: () => { setNewContact({ name: "", phone: "", relationship: "Family" }); setIsAddOpen(false); } }
    );
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4 p-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emergency Contacts</h1>
            <p className="text-muted-foreground">People who will be notified in emergencies</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Emergency Contact</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Contact name" value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Select value={newContact.relationship} onValueChange={(v) => setNewContact({ ...newContact, relationship: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Family", "Friend", "Partner", "Colleague", "Other"].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddContact} className="w-full" disabled={addContact.isPending}>
                  {addContact.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {contacts.find(c => c.is_primary) && (
          <Card className="gradient-card shadow-card border-0 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />Primary Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.filter(c => c.is_primary).map((contact) => (
                <div key={contact.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                  <Button variant="default" size="icon" className="bg-safe hover:bg-safe/90" onClick={() => handleCall(contact.phone)}>
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="gradient-card shadow-card border-0">
          <CardHeader><CardTitle className="text-lg font-semibold">All Contacts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No contacts added yet</p>
                <p className="text-sm">Add emergency contacts to get started</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{contact.name}</p>
                      {contact.is_primary && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Primary</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{contact.relationship} • {contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!contact.is_primary && (
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"
                        onClick={() => setPrimary.mutate(contact.id)}>
                        <Heart className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-safe hover:text-safe hover:bg-safe/10"
                      onClick={() => handleCall(contact.phone)}>
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteContact.mutate(contact.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card border-0 bg-accent/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Your primary contact will be called first during an SOS alert.
              We recommend adding at least 3 trusted contacts.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Contacts;
