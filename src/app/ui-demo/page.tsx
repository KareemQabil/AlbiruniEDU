'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Label,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  Skeleton,
  Loading,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';
import { Sparkles, Send, User } from 'lucide-react';

export default function UIDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-dark p-8">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold">
            مكتبة المكونات - UI Component Library
          </h1>
          <p className="text-lg text-muted-foreground">
            عرض جميع مكونات الواجهة مع التصميم الزجاجي ودعم RTL
          </p>
        </div>

        {/* Buttons */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>الأزرار - Buttons</CardTitle>
            <CardDescription>
              جميع أنواع الأزرار بالتصميم الزجاجي
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>افتراضي</Button>
            <Button variant="glass">زجاجي</Button>
            <Button variant="secondary">ثانوي</Button>
            <Button variant="destructive">حذف</Button>
            <Button variant="outline">حدود</Button>
            <Button variant="ghost">شبح</Button>
            <Button variant="link">رابط</Button>
            <Button size="sm">صغير</Button>
            <Button size="lg">كبير</Button>
            <Button size="icon">
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button disabled>معطل</Button>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>بطاقة افتراضية</CardTitle>
              <CardDescription>وصف البطاقة</CardDescription>
            </CardHeader>
            <CardContent>
              <p>محتوى البطاقة الافتراضية مع حدود وظل.</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>بطاقة زجاجية</CardTitle>
              <CardDescription>تأثير زجاجي</CardDescription>
            </CardHeader>
            <CardContent>
              <p>بطاقة بتأثير زجاجي مع شفافية وتمويه الخلفية.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>بطاقة مرتفعة</CardTitle>
              <CardDescription>ظل قوي</CardDescription>
            </CardHeader>
            <CardContent>
              <p>بطاقة مرتفعة مع ظل قوي عند التمرير.</p>
            </CardContent>
          </Card>
        </div>

        {/* Form Elements */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>عناصر النماذج - Form Elements</CardTitle>
            <CardDescription>
              حقول الإدخال مع دعم RTL والتحقق
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@albiruni.edu"
              helperText="أدخل بريدك الإلكتروني"
            />
            <Input
              label="كلمة المرور"
              type="password"
              placeholder="********"
              error="كلمة المرور قصيرة جداً"
            />
            <Input variant="glass" placeholder="حقل إدخال زجاجي" />
            <Textarea
              label="الرسالة"
              placeholder="اكتب رسالتك هنا..."
              helperText="الحد الأقصى 500 حرف"
            />
            <Textarea variant="glass" placeholder="نص زجاجي" />
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              onClick={() => toast.success('تم الإرسال بنجاح!')}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              إرسال
            </Button>
            <Button variant="outline">إلغاء</Button>
          </CardFooter>
        </Card>

        {/* Dialog */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>النوافذ المنبثقة - Dialogs</CardTitle>
            <CardDescription>نوافذ مودال بتصميم زجاجي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="glass">فتح نافذة منبثقة</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>هل أنت متأكد؟</DialogTitle>
                  <DialogDescription>
                    هذا الإجراء لا يمكن التراجع عنه. سيتم حذف بياناتك نهائياً.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      toast.error('تم الحذف!');
                      setOpen(false);
                    }}
                  >
                    حذف
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="space-y-2">
              <p className="text-sm font-medium">أمثلة Toast:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => toast.success('عملية ناجحة!')}
                >
                  نجاح
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => toast.error('حدث خطأ!')}
                >
                  خطأ
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info('معلومة مفيدة')}
                >
                  معلومة
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.warning('تحذير!')}
                >
                  تحذير
                </Button>
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() =>
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: 'جاري التحميل...',
                        success: 'تم بنجاح!',
                        error: 'فشلت العملية',
                      }
                    )
                  }
                >
                  Promise
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>الشارات - Badges</CardTitle>
            <CardDescription>شارات التصنيف والحالة</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>افتراضي</Badge>
            <Badge variant="secondary">ثانوي</Badge>
            <Badge variant="destructive">خطر</Badge>
            <Badge variant="outline">حدود</Badge>
            <Badge variant="success">نجاح</Badge>
            <Badge variant="warning">تحذير</Badge>
            <Badge variant="info">معلومة</Badge>
            <Badge variant="glass">زجاجي</Badge>
          </CardContent>
        </Card>

        {/* Loading & Skeleton */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>التحميل والهياكل - Loading & Skeletons</CardTitle>
            <CardDescription>حالات التحميل والهياكل</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>حالات التحميل:</Label>
              <div className="flex flex-wrap gap-4">
                <Loading size="sm" />
                <Loading size="default" />
                <Loading size="lg" />
                <Loading size="xl" />
                <Loading text="جاري التحميل..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الهياكل:</Label>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>الصور الرمزية - Avatars</CardTitle>
            <CardDescription>صور المستخدمين</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="مستخدم"
              />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">أح</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        {/* Full Example */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>أح</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>أحمد محمد</CardTitle>
                  <CardDescription className="flex gap-2">
                    <Badge variant="success">نشط</Badge>
                    <Badge variant="glass">طالب</Badge>
                  </CardDescription>
                </div>
              </div>
              <Button variant="glass">تعديل</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="الاسم الكامل"
                defaultValue="أحمد محمد"
                variant="glass"
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                defaultValue="ahmed@example.com"
                variant="glass"
              />
            </div>
            <Textarea
              label="نبذة عنك"
              variant="glass"
              defaultValue="طالب شغوف بالتعلم والتكنولوجيا..."
            />
          </CardContent>
          <CardFooter className="gap-2">
            <Button>حفظ التغييرات</Button>
            <Button variant="outline">إلغاء</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
