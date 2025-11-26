import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { useProfile, useUpdateProfile } from '../../hooks/useProfile'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Skeleton } from '../../components/ui/skeleton'
import { User, Moon, Sun, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { logError } from '../../lib/logger'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setPartnerName(profile.partner_name || '')
      setWeddingDate(profile.wedding_date || '')
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        partner_name: partnerName || null,
        wedding_date: weddingDate || null,
      })
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (error: any) {
      logError('Profile update error', error, 'Profile')
      const errorMessage = error?.message || error?.error?.message || 'Failed to update profile'
      toast.error(errorMessage)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="space-y-6">
      <SEO
        title={PAGE_SEO.profile.title}
        description={PAGE_SEO.profile.description}
        path="/dashboard/profile"
        noIndex
      />

      {/* Header Section */}
      <motion.div
        className="space-y-0.5 sm:space-y-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0 }}
      >
        <motion.h1
          className="text-2xl sm:text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          Profile
        </motion.h1>
        <motion.p
          className="text-sm sm:text-base text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        >
          Manage your account settings
        </motion.p>
      </motion.div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
      >
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
              >
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </motion.div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg">Personal Information</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">{user?.email}</CardDescription>
                </div>
              </motion.div>
              <AnimatePresence mode="wait">
                {!isEditing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" onClick={() => setIsEditing(true)} className="min-h-[44px] w-full sm:w-auto">
                        Edit
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="space-y-3 sm:space-y-4"
                >
                  <motion.div
                    className="grid gap-3 sm:gap-4 grid-cols-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.1,
                        },
                      },
                    }}
                  >
                    <motion.div
                      className="space-y-1.5 sm:space-y-2"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                    </motion.div>
                    <motion.div
                      className="space-y-1.5 sm:space-y-2"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="space-y-1.5 sm:space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
                  >
                    <Label htmlFor="partnerName" className="text-xs sm:text-sm">Partner's Name</Label>
                    <Input
                      id="partnerName"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </motion.div>
                  <motion.div
                    className="space-y-1.5 sm:space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
                  >
                    <Label htmlFor="weddingDate" className="text-xs sm:text-sm">Wedding Date</Label>
                    <Input
                      id="weddingDate"
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </motion.div>
                  <motion.div
                    className="flex gap-2 pt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none"
                    >
                      <Button onClick={handleSave} disabled={updateProfile.isPending} className="flex-1 sm:flex-none min-h-[44px] w-full">
                        {updateProfile.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none"
                    >
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none min-h-[44px] w-full">
                        Cancel
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="space-y-3 sm:space-y-4"
                >
                  <motion.div
                    className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {[
                      { label: 'Name', value: `${firstName} ${lastName}` },
                      { label: 'Partner', value: partnerName || 'Not set' },
                      { label: 'Wedding Date', value: weddingDate ? new Date(weddingDate).toLocaleDateString() : 'Not set', span: 'col-span-2 sm:col-span-1' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className={item.span || ''}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      >
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium text-sm sm:text-base">{item.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme Settings - Hidden for now */}
      {/* <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Customize how NikahPrep looks</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium text-sm sm:text-base">Theme</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="min-h-[44px] w-full sm:w-auto">
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.8 }}
      >
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 1 }}
            >
              <CardTitle className="text-base sm:text-lg">Account</CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="destructive" onClick={handleSignOut} className="min-h-[44px] w-full sm:w-auto">
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 2 }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </motion.div>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
