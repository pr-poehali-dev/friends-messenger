import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'developer' | 'user';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isFriend?: boolean;
  lastSeen?: Date;
  isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  userId: string;
  messages: Message[];
  isTyping?: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchUsername, setSearchUsername] = useState('');

  const [users] = useState<User[]>([
    {
      id: 'dev1',
      username: 'skzry',
      firstName: 'Разработчик',
      lastName: 'Главный',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=skzry',
      role: 'developer',
      isOnline: true,
    },
    {
      id: '2',
      username: 'anna_ivanova',
      firstName: 'Анна',
      lastName: 'Иванова',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
      role: 'user',
      isFriend: true,
      lastSeen: new Date(Date.now() - 300000),
    },
    {
      id: '3',
      username: 'mikhail_v',
      firstName: 'Михаил',
      lastName: 'Волков',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mikhail',
      role: 'user',
      lastSeen: new Date(Date.now() - 3600000),
    },
  ]);

  const [chats] = useState<Chat[]>([
    {
      id: '1',
      userId: 'dev1',
      messages: [
        { id: '1', senderId: 'dev1', text: 'Привет! Добро пожаловать в FriendsMess', timestamp: new Date() },
      ],
    },
    {
      id: '2',
      userId: '2',
      messages: [
        { id: '2', senderId: '2', text: 'Привет! Как дела?', timestamp: new Date(Date.now() - 600000) },
      ],
    },
  ]);

  const handleLogin = () => {
    if (loginData.login === 'skzry' && loginData.password === '22') {
      setIsAuthenticated(true);
      setCurrentUser({
        id: 'dev1',
        username: 'skzry',
        firstName: 'Разработчик',
        lastName: 'Главный',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=skzry',
        role: 'developer',
        isOnline: true,
      });
    } else if (loginData.login && loginData.password) {
      setIsAuthenticated(true);
      setShowProfileSetup(true);
    }
  };

  const handleRegistration = () => {
    if (loginData.login && loginData.password) {
      toast({
        title: 'Запрос отправлен',
        description: 'Ваш запрос на создание аккаунта отправлен администратору',
      });
      setShowRegistration(false);
    }
  };

  const handleProfileSetup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setCurrentUser({
      id: 'current',
      username: formData.get('username') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      role: 'user',
      isOnline: true,
    });
    setShowProfileSetup(false);
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      toast({
        title: 'Сообщение отправлено',
        description: messageText,
      });
      setMessageText('');
    }
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const getRoleBadge = (user: User) => {
    if (user.role === 'developer') {
      return (
        <Badge 
          className="ml-2 bg-[hsl(var(--developer-badge))] hover:bg-[hsl(var(--developer-badge))]/90 text-white cursor-pointer transition-all"
          title="Разработчик"
        >
          <Icon name="CheckCheck" size={12} />
        </Badge>
      );
    }
    if (user.isFriend) {
      return (
        <Badge 
          className="ml-2 bg-[hsl(var(--friend-badge))] hover:bg-[hsl(var(--friend-badge))]/90 text-white cursor-pointer transition-all"
          title="Друг разработчика. Верифицированный пользователь"
        >
          <Icon name="Check" size={12} />
        </Badge>
      );
    }
    return null;
  };

  const formatLastSeen = (date?: Date, isOnline?: boolean) => {
    if (isOnline) return 'В сети';
    if (!date) return 'Был(а) давно';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 60) return `Был(а) ${minutes} мин. назад`;
    return `Был(а) ${hours} ч. назад`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
        <Card className="w-full max-w-md p-8 shadow-2xl animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary mb-4 shadow-lg">
              <Icon name="MessageSquare" size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FriendsMess
            </h1>
            <p className="text-muted-foreground mt-2">Мессенджер для избранных</p>
          </div>

          {!showRegistration ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  placeholder="Введите логин"
                  value={loginData.login}
                  onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg">
                Войти
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRegistration(true)} 
                className="w-full hover-scale"
              >
                Запросить создание аккаунта
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-center">Запрос на регистрацию</h2>
              <div>
                <Label htmlFor="reg-login">Логин</Label>
                <Input
                  id="reg-login"
                  placeholder="Придумайте логин"
                  value={loginData.login}
                  onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reg-password">Пароль</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Придумайте пароль"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleRegistration} className="w-full bg-gradient-to-r from-secondary to-accent">
                Отправить запрос
              </Button>
              <Button variant="ghost" onClick={() => setShowRegistration(false)} className="w-full">
                Назад
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
        <Card className="w-full max-w-md p-8 shadow-2xl animate-scale-in">
          <h2 className="text-2xl font-bold text-center mb-6">Настройка профиля</h2>
          <form onSubmit={handleProfileSetup} className="space-y-4">
            <div>
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" name="firstName" placeholder="Ваше имя" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" name="lastName" placeholder="Ваша фамилия" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="Ваш username" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="avatar">Фотография (необязательно)</Label>
              <Input id="avatar" name="avatar" type="file" accept="image/*" className="mt-1" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
              Продолжить
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r flex flex-col bg-card">
          <div className="p-4 border-b bg-gradient-to-r from-primary to-secondary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="ring-2 ring-white shadow-lg">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="bg-white text-primary font-semibold">
                    {currentUser?.firstName[0]}{currentUser?.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <p className="font-semibold">{currentUser?.firstName}</p>
                  <p className="text-xs opacity-90">@{currentUser?.username}</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Icon name="MoreVertical" size={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Настройки</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="User" size={18} className="mr-2" />
                      Редактировать профиль
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="Bell" size={18} className="mr-2" />
                      Включить уведомления
                    </Button>
                    <Separator />
                    <Button variant="destructive" className="w-full justify-start" onClick={() => setIsAuthenticated(false)}>
                      <Icon name="LogOut" size={18} className="mr-2" />
                      Выйти
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="chats">Чаты</TabsTrigger>
              <TabsTrigger value="contacts">Контакты</TabsTrigger>
            </TabsList>

            <TabsContent value="chats" className="flex-1 m-0">
              <ScrollArea className="h-full">
                {chats.map((chat) => {
                  const user = getUserById(chat.userId);
                  if (!user) return null;
                  const lastMessage = chat.messages[chat.messages.length - 1];

                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-all ${
                        selectedChat === chat.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="font-semibold truncate">{user.firstName} {user.lastName}</p>
                            {getRoleBadge(user)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.isTyping ? (
                              <span className="text-primary italic">Печатает...</span>
                            ) : (
                              lastMessage?.text
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="contacts" className="flex-1 m-0">
              <div className="p-4">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по username"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ScrollArea className="h-full">
                {users.map((user) => (
                  <div key={user.id} className="p-4 border-b hover:bg-muted/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-card" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-semibold">{user.firstName} {user.lastName}</p>
                          {getRoleBadge(user)}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                      <Button size="sm" variant="outline" className="hover-scale">
                        <Icon name="UserPlus" size={16} className="mr-1" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={getUserById(chats.find(c => c.id === selectedChat)?.userId || '')?.avatar} />
                    <AvatarFallback>
                      {getUserById(chats.find(c => c.id === selectedChat)?.userId || '')?.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <p className="font-semibold">
                        {getUserById(chats.find(c => c.id === selectedChat)?.userId || '')?.firstName}
                      </p>
                      {getRoleBadge(getUserById(chats.find(c => c.id === selectedChat)?.userId || '')!)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatLastSeen(
                        getUserById(chats.find(c => c.id === selectedChat)?.userId || '')?.lastSeen,
                        getUserById(chats.find(c => c.id === selectedChat)?.userId || '')?.isOnline
                      )}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chats.find(c => c.id === selectedChat)?.messages.map((message) => {
                    const isOwnMessage = message.senderId === 'current';
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-primary to-secondary text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {message.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-card">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Введите сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6"
                    disabled={!messageText.trim()}
                  >
                    <Icon name="Send" size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Icon name="MessageSquare" size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Выберите чат для начала общения</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;