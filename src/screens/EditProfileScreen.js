import { useState } from 'react';
import { PhotoPicker } from '@/components/PhotoPicker';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Instagram, Whatsapp, Telegram, Snapchat } from 'lucide-react';

export default function EditProfileScreen() {
  const [photo, setPhoto] = useState(null);
  const [contacts, setContacts] = useState({
    whatsapp: '',
    instagram: '',
    telegram: '',
    snapchat: '',
  });

  const userProfile = {
    name: 'Maria Clara Silva',
    birthDate: '25/08/1995',
    zodiacSign: 'Virgem',
    contactMessage: 'Oi! Gostei do seu perfil, vamos conversar? 😊',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContacts({ ...contacts, [name]: value });
  };

  const handleSave = () => {
    console.log('Contacts:', contacts);
    console.log('Photo:', photo);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <PhotoPicker photo={photo} setPhoto={setPhoto} />
            <h2 className="text-xl font-semibold">{userProfile.name}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de nascimento" value={userProfile.birthDate} readOnly />
            <Input label="Signo" value={userProfile.zodiacSign} readOnly />
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Contatos</h3>
            <div className="flex items-center space-x-2">
              <Whatsapp className="text-green-500" />
              <Input name="whatsapp" value={contacts.whatsapp} onChange={handleChange} placeholder="Whatsapp" />
            </div>

            <div className="flex items-center space-x-2">
              <Instagram className="text-pink-500" />
              <Input name="instagram" value={contacts.instagram} onChange={handleChange} placeholder="Instagram" />
            </div>

            <div className="flex items-center space-x-2">
              <Telegram className="text-blue-500" />
              <Input name="telegram" value={contacts.telegram} onChange={handleChange} placeholder="Telegram" />
            </div>

            <div className="flex items-center space-x-2">
              <Snapchat className="text-yellow-400" />
              <Input name="snapchat" value={contacts.snapchat} onChange={handleChange} placeholder="Snapchat" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Mensagem padrão</h3>
            <Textarea value={userProfile.contactMessage} readOnly rows={3} />
          </div>

          <Button className="w-full" onClick={handleSave}>Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
