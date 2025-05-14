import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, ChevronRight, User, Settings, MapPin, Calendar } from "lucide-react";

interface OnboardingGuideProps {
  onComplete: () => void;
}

export default function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(true);
  
  const totalSteps = 5;
  
  const goToNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setOpen(false);
      onComplete();
    }
  };
  
  const goToPage = (page: string) => {
    setLocation(page);
    setOpen(false);
    onComplete();
  };
  
  const steps = [
    {
      title: "Welcome to Amazon Flex Bot!",
      description: "This tutorial will guide you through setting up your account and using the bot to find and accept Amazon Flex shifts.",
      content: (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <CheckCircle size={48} className="text-primary" />
            </div>
            <h3 className="text-xl font-medium">You're almost ready!</h3>
            <p className="text-muted-foreground mt-2">
              Complete this quick setup guide to start using the Amazon Flex Bot.
            </p>
          </div>
        </div>
      ),
      action: "Let's Get Started"
    },
    {
      title: "Step 1: Connect Your Amazon Account",
      description: "Link your Amazon Flex account to enable the bot to search for shifts on your behalf.",
      content: (
        <div className="space-y-6 py-4">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-primary/10 p-3">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Connect Your Amazon Account</h3>
              <p className="text-muted-foreground mt-1">
                You'll need to link your Amazon Flex account before you can start searching for shifts.
              </p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => goToPage("/account")}
                  className="flex items-center"
                >
                  Go to Account Settings
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
      action: "Next Step"
    },
    {
      title: "Step 2: Set Up Location Preferences",
      description: "Choose which Amazon Flex locations you want to search for shifts at.",
      content: (
        <div className="space-y-6 py-4">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-primary/10 p-3">
              <MapPin size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Choose Your Locations</h3>
              <p className="text-muted-foreground mt-1">
                Select which Amazon Flex locations you want to work at, and set preferences for each one:
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                <li>Minimum pay rates</li>
                <li>Hourly rate requirements</li>
                <li>Arrival buffer time</li>
                <li>Preferred shift durations</li>
              </ul>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => goToPage("/settings")}
                  className="flex items-center"
                >
                  Go to Settings
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
      action: "Next Step"
    },
    {
      title: "Step 3: Configure Search Schedule",
      description: "Set up when you want the bot to look for shifts throughout the week.",
      content: (
        <div className="space-y-6 py-4">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Calendar size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Schedule Your Searches</h3>
              <p className="text-muted-foreground mt-1">
                Define when the bot should search for shifts:
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                <li>Set specific days and times</li>
                <li>Choose search strategy (steady or burst)</li>
                <li>Configure automatic captcha solving</li>
                <li>Set your notification preferences</li>
              </ul>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => goToPage("/settings")}
                  className="flex items-center"
                >
                  Configure Schedule
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
      action: "Next Step"
    },
    {
      title: "Step 4: Start Searching!",
      description: "You're all set to start searching for Amazon Flex shifts automatically.",
      content: (
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-green-100 p-6 mb-4">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h3 className="text-xl font-medium">You're Ready to Go!</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Head back to the Dashboard to start searching for shifts.
            </p>
            <Button 
              onClick={() => goToPage("/")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      ),
      action: "Finish Tutorial"
    }
  ];
  
  const currentStep = steps[step - 1];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        
        {currentStep.content}
        
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div>
          <Button onClick={goToNextStep}>{currentStep.action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}