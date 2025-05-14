import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const accountSchema = z.object({
  amazonEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  amazonPassword: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  notificationNumber: z.string().optional().or(z.literal("")),
});

export default function Account() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      amazonEmail: user?.amazonEmail || "",
      amazonPassword: "",
      notificationNumber: user?.notificationNumber || "",
    },
  });

  async function onSubmit(values: z.infer<typeof accountSchema>) {
    setIsSubmitting(true);
    try {
      // Only send non-empty values to avoid overwriting with empty strings
      const updateData: any = {};
      if (values.amazonEmail) updateData.amazonEmail = values.amazonEmail;
      if (values.amazonPassword) updateData.amazonPassword = values.amazonPassword;
      if (values.notificationNumber) updateData.notificationNumber = values.notificationNumber;
      
      await updateUser(updateData);
      
      toast({
        title: "Account Updated",
        description: "Your account information has been saved.",
      });
      
      // Clear password field after successful update
      form.setValue("amazonPassword", "");
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update account information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Amazon Flex Account</h2>
                  
                  {!user?.amazonEmail && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Account Not Connected</AlertTitle>
                      <AlertDescription>
                        Connect your Amazon Flex account to use the bot
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {user?.amazonEmail && (
                    <Alert className="mb-4 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle>Account Connected</AlertTitle>
                      <AlertDescription>
                        Your Amazon Flex account is connected and ready to use
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Connect with Amazon Account</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      We use Amazon's secure authentication to connect to your Flex account. We never store your password.
                    </p>
                    <Button 
                      onClick={() => window.open("https://www.amazon.com/ap/signin?ie=UTF8&clientContext=134-9172090-0857541&openid.pape.max_auth_age=0&use_global_authentication=false&accountStatusPolicy=P1&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&use_audio_captcha=false&language=en_US&pageId=amzn_device_na&arb=97b4a0fe-13b8-45fd-b405-ae94b0fec45b&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fap%2Fmaplanding&openid.assoc_handle=amzn_device_na&openid.oa2.response_type=token&openid.mode=checkid_setup&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.ns.oa2=http%3A%2F%2Fwww.amazon.com%2Fap%2Fext%2Foauth%2F2&openid.oa2.scope=device_auth_access&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&disableLoginPrepopulate=0&openid.oa2.client_id=device%3A32663430323338643639356262653236326265346136356131376439616135392341314d50534c4643374c3541464b&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0", "_blank")}
                      className="w-full"
                    >
                      Sign in with Amazon
                    </Button>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">
                        After signing in, Amazon will display a "Page Not Found" screen with a URL containing your authentication token. 
                        Copy that URL and paste it below:
                      </p>
                      <div className="mt-2">
                        <Input 
                          placeholder="Paste the redirect URL here" 
                          onChange={async (e) => {
                            // Get token from URL
                            const url = e.target.value;
                            if (url.includes('openid.identity=')) {
                              try {
                                // Send to our backend to process
                                const response = await fetch('/api/amazon/auth', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  credentials: 'include',
                                  body: JSON.stringify({ amazonAuthUrl: url })
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  // Update the form field
                                  form.setValue('amazonEmail', data.user.amazonEmail);
                                  
                                  toast({
                                    title: "Authentication Successful",
                                    description: "Amazon Flex account connected successfully.",
                                  });
                                  
                                  // If user object is available in the current component, update it
                                  if (updateUser) {
                                    await updateUser({ amazonEmail: data.user.amazonEmail });
                                  }
                                } else {
                                  const errorData = await response.json();
                                  throw new Error(errorData.message || 'Failed to authenticate with Amazon');
                                }
                              } catch (error) {
                                toast({
                                  title: "Authentication Failed",
                                  description: error instanceof Error ? error.message : "Could not connect Amazon account",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="amazonEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amazon User ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Amazon ID will appear here after authentication" {...field} readOnly />
                        </FormControl>
                        <FormDescription>
                          Your Amazon ID is used to identify your Flex account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-semibold">Notification Settings</h2>
                  
                  <FormField
                    control={form.control}
                    name="notificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Number</FormLabel>
                        <FormControl>
                          <Input placeholder="07XXX XXXXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll send you SMS notifications when shifts are accepted
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Account Security</h2>
            <p className="text-sm text-gray-500 mb-4">
              Change your account password or update security settings
            </p>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
