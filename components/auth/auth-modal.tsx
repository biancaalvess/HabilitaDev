"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)

  const handleSuccess = () => {
    onClose()
  }

  const handleSwitchMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="p-6 pt-0">
          {isLogin ? (
            <LoginForm onSuccess={handleSuccess} onSwitchToRegister={handleSwitchMode} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={handleSwitchMode} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
