import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle, Mail, MessageSquare } from "lucide-react";

export default function Help() {
  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions about using the Amazon Flex Bot</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does the Amazon Flex Bot work?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    The Amazon Flex Bot automatically searches for available shifts on your Amazon Flex account based on your preferences. When it finds shifts that match your criteria, it can automatically accept them for you.
                  </p>
                  <p>
                    The bot uses your Amazon Flex credentials to log in and monitor the offers page. You can set specific location preferences, minimum pay rates, shift durations, and schedules to customize when and what kind of shifts you want the bot to find.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it safe to store my Amazon credentials?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Your Amazon credentials are encrypted and stored securely in our database. We never share your credentials with third parties, and they are only used to connect to Amazon Flex on your behalf. You can remove your credentials at any time from your account settings.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>What's the difference between search strategies?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    <strong>Short Burst:</strong> Uses rapid, short-duration searches with shorter idle times between refreshes. This is ideal when you know shifts are being released at a specific time and want to maximize your chances of catching them.
                  </p>
                  <p>
                    <strong>Steady Long Search:</strong> Uses a more balanced approach with moderate refresh intervals. This is better for searching over longer periods and conserves resources while still being effective at finding shifts.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I set up location preferences?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Go to the Settings page and navigate to the Locations tab. Here you can enable or disable different Amazon Flex locations. For each enabled location, you can set specific preferences like minimum pay, hourly rate, arrival buffer time, and preferred shift duration in the Offer Settings tab.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What if I encounter a CAPTCHA?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    The bot has an automatic CAPTCHA solving capability that you can enable or disable in the Search Settings. When enabled, the bot will attempt to solve CAPTCHAs automatically to continue searching. If for some reason the CAPTCHA cannot be solved automatically, the bot will pause and notify you.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started Guide</CardTitle>
            <CardDescription>Learn how to set up and use the Amazon Flex Bot effectively</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium mb-2">Step 1: Connect Your Amazon Account</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Add your Amazon Flex credentials in your Account Settings to allow the bot to search for shifts on your behalf.
                </p>
                <Button variant="outline" size="sm">View Account Settings</Button>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium mb-2">Step 2: Configure Your Preferences</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Set up your location preferences, minimum pay rates, and schedule to customize what shifts the bot should look for.
                </p>
                <Button variant="outline" size="sm">View Settings</Button>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium mb-2">Step 3: Start Searching</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Once everything is configured, go to the Dashboard and click "Start Search" to begin looking for shifts.
                </p>
                <Button variant="outline" size="sm">Go to Dashboard</Button>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium mb-2">Step 4: Monitor Results</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Check the Dashboard or History page to see found offers, accepted shifts, and activity logs.
                </p>
                <Button variant="outline" size="sm">View History</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Need further assistance? Reach out to our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-md">
                <Mail className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Email Support</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Send us an email with your question and we'll get back to you
                </p>
                <Button variant="outline">Contact via Email</Button>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-md">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Live Chat</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Chat with our support team for immediate assistance
                </p>
                <Button>Start Live Chat</Button>
              </div>
            </div>
            
            <div className="mt-6 p-4 border rounded-md bg-blue-50">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="font-medium text-blue-600">Support Hours</h3>
                  <p className="text-sm text-gray-700">
                    Our support team is available Monday through Friday, 9:00 AM to 5:00 PM GMT.
                    For urgent issues outside these hours, please use the emergency contact form.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-amber-600">Important Notice</h3>
                <p className="text-sm text-gray-700">
                  This tool is designed to help you find Amazon Flex shifts more efficiently, but it's
                  your responsibility to ensure you comply with Amazon's terms of service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
