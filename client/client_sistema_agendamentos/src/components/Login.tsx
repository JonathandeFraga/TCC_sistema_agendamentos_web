import { Sparkles, User } from "lucide-react";
import { Card } from "./ui/card";

interface LoginProps {
    onSelectUserType: (type: 'professional' | 'client') => void;
}

export function Login({ onSelectUserType }: LoginProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-pink-600">Nails</h1>
          <p className="text-gray-600">Booking Service</p>
        </div>

        <div className="space-y-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-300"
                onClick={() => onSelectUserType('professional')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">Profissional</h3>
                <p className="text-gray-600">Acesse dados e agendamentos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-300"
                onClick={() => onSelectUserType('client')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">Cliente</h3>
                <p className="text-gray-600">Agende seus serviços</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
    )
}