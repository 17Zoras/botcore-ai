import { Phone, Plus, User, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useContacts } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";

const EmergencyContacts = () => {
  const { contacts, isLoading } = useContacts();

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (isLoading) {
    return <Card className="gradient-card shadow-card border-0"><CardContent className="p-4 space-y-3">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
    </CardContent></Card>;
  }

  return (
    <Card className="gradient-card shadow-card border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />Emergency Contacts
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
            <NavLink to="/contacts"><Plus className="w-4 h-4 mr-1" />Add</NavLink>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No contacts yet. Add your first emergency contact.</p>
        ) : (
          contacts.slice(0, 3).map((contact) => (
            <div key={contact.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.relationship}</p>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0 text-safe hover:text-safe hover:bg-safe/10"
                onClick={() => handleCall(contact.phone)}>
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
        <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" asChild>
          <NavLink to="/contacts">View all contacts →</NavLink>
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
