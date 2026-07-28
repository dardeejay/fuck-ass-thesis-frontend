"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import LabelClient from "@/components/dashboard/label-client"
import type { LivePredictionResponse } from "@/lib/handa-api"

export default function LabelModal({ live }: { live: LivePredictionResponse }) {
  const router = useRouter()

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Label Today</DialogTitle>
          <DialogDescription>
            Record what actually happened today as training data for the model.
          </DialogDescription>
        </DialogHeader>
        <LabelClient live={live} />
      </DialogContent>
    </Dialog>
  )
}
