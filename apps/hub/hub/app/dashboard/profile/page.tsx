'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { usersApi } from '@/lib/api/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Calendar, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  countryCode: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      countryCode: user?.countryCode || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        countryCode: user.countryCode || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await usersApi.updateProfile(user.id, {
        name: data.name,
        countryCode: data.countryCode || undefined,
      });

      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
      } else if (!response.success) {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Profile
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your personal information and account details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    className="pl-10"
                    {...register('name')}
                    disabled={isSaving}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryCode">Country Code (Optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="countryCode"
                    className="pl-10"
                    placeholder="US, NG, GB, etc."
                    maxLength={2}
                    {...register('countryCode')}
                    disabled={isSaving}
                  />
                </div>
                {errors.countryCode && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.countryCode.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View your account details and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                User ID
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                {user?.id?.substring(0, 8)}...
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                {user?.role || 'user'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Subscription
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                {user?.subscriptionTier || 'free'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email Verified
              </span>
              <span
                className={`text-sm ${
                  user?.isEmailVerified
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Status
              </span>
              <span
                className={`text-sm ${
                  user?.isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Member Since
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

