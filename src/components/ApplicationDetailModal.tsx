import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  teamMembers: string[];
}

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  projectName,
  teamMembers,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Project: {projectName}
          </DialogTitle>
          <DialogDescription>
            Team members listed in submission order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <span>{member}</span>
              {index === 0 && (
                <span className="text-xs font-semibold text-green-600">
                  Team Leader
                </span>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
