import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PAGE_SEO } from '../lib/seo'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { DatePicker } from '../components/ui/date-picker'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import toast from 'react-hot-toast'
import { logError } from '../lib/logger'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

type Step = 1 | 2 | 3 | 4

const TOTAL_STEPS = 4

// Common countries list (you can expand this)
const COUNTRIES = [
  { value: '', label: 'Select country...' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'IN', label: 'India' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'OTHER', label: 'Other' },
]

export default function ProfileSetupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Essential
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)

  // Step 2: Personalization
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say' | ''>('')
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Engaged' | 'Researching' | ''>('')

  // Step 3: Location
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')

  // Step 4: Relationship
  const [partnerName, setPartnerName] = useState('')
  const [partnerUsingApp, setPartnerUsingApp] = useState<boolean | null>(null)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [weddingDate, setWeddingDate] = useState('')

  // Name validation utility
  // Allows: letters (A-Z, a-z), spaces, hyphens, apostrophes
  // Prevents: numbers, special characters, multiple consecutive spaces/hyphens/apostrophes
  const validateName = (name: string, fieldName: string = 'Name'): string | null => {
    const trimmed = name.trim()
    
    if (!trimmed) {
      return `${fieldName} is required`
    }
    
    if (trimmed.length < 2) {
      return `${fieldName} must be at least 2 characters`
    }
    
    if (trimmed.length > 50) {
      return `${fieldName} must be 50 characters or less`
    }
    
    // Allow letters, spaces, hyphens, and apostrophes
    // Prevent multiple consecutive spaces, hyphens, or apostrophes
    // Prevent leading/trailing spaces, hyphens, or apostrophes (handled by trim)
    if (!/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(trimmed)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    }
    
    // Prevent multiple consecutive special characters
    if (/[\s'-]{2,}/.test(trimmed)) {
      return `${fieldName} cannot have multiple consecutive spaces, hyphens, or apostrophes`
    }
    
    return null
  }

  // Handle first name input with real-time validation
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow only valid characters as user types
    // This regex allows letters, spaces, hyphens, and apostrophes
    if (value === '' || /^[A-Za-z\s'-]*$/.test(value)) {
      setFirstName(value)
      
      // Real-time validation (only show error after user has typed something)
      if (value.trim().length > 0) {
        const error = validateName(value, 'First name')
        setFirstNameError(error)
      } else {
        setFirstNameError(null)
      }
    }
  }

  // Handle last name input with real-time validation (optional field)
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow only valid characters as user types
    if (value === '' || /^[A-Za-z\s'-]*$/.test(value)) {
      setLastName(value)
      
      // Only validate if user has entered something (since it's optional)
      if (value.trim().length > 0) {
        const error = validateName(value, 'Last name')
        setLastNameError(error)
      } else {
        setLastNameError(null)
      }
    }
  }

  // Validation
  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        const firstNameValidation = validateName(firstName, 'First name')
        if (firstNameValidation) {
          setFirstNameError(firstNameValidation)
          toast.error(firstNameValidation)
          return false
        }
        
        // Validate last name only if provided (it's optional)
        if (lastName.trim()) {
          const lastNameValidation = validateName(lastName, 'Last name')
          if (lastNameValidation) {
            setLastNameError(lastNameValidation)
            toast.error(lastNameValidation)
            return false
          }
        }
        
        setFirstNameError(null)
        setLastNameError(null)
        return true
      case 2:
        if (!dateOfBirth) {
          toast.error('Date of birth is required')
          return false
        }
        const birthDate = new Date(dateOfBirth)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
        
        if (actualAge < 18) {
          toast.error('You must be 18 years or older to use this platform')
          return false
        }
        if (actualAge > 120) {
          toast.error('Please enter a valid date of birth')
          return false
        }
        if (!gender) {
          toast.error('Gender is required')
          return false
        }
        if (!maritalStatus) {
          toast.error('Marital status is required')
          return false
        }
        return true
      case 3:
        // Location is optional, but if country is selected, validate
        if (country && !city.trim()) {
          toast.error('Please enter your city')
          return false
        }
        return true
      case 4:
        // All fields optional in step 4
        if (partnerUsingApp === true && !partnerEmail.trim()) {
          toast.error('Please enter your partner\'s email address')
          return false
        }
        if (partnerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
          toast.error('Please enter a valid email address')
          return false
        }
        return true
      default:
        return true
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => (prev + 1) as Step)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)

    try {
      const age = dateOfBirth ? calculateAge(dateOfBirth) : null

      const profileData: any = {
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        date_of_birth: dateOfBirth || null,
        age: age,
        gender: gender || null,
        marital_status: maritalStatus || null,
        country: country || null,
        city: city.trim() || null,
        partner_name: partnerName.trim() || null,
        partner_using_app: partnerUsingApp,
        partner_email: partnerEmail.trim() || null,
        wedding_date: weddingDate || null,
        profile_visibility: 'public', // Default to public
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData)

      if (error) throw error

      // If partner is using app and email provided, send invitation
      if (partnerUsingApp === true && partnerEmail.trim()) {
        // TODO: Implement partner invitation logic
        toast.success('Profile saved! Partner invitation will be sent.')
      } else {
        toast.success('Profile saved! Welcome to NikahPrep.')
      }

      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      logError('Profile save error', error, 'ProfileSetup')
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-green-500/10 p-4">
      <SEO
        title={PAGE_SEO.profileSetup.title}
        description={PAGE_SEO.profileSetup.description}
        path="/profile-setup"
        noIndex
      />

      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0 }}
      >
        <Card>
          <CardHeader className="space-y-4">
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              <motion.div
                className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-islamic-gold rounded-full flex items-center justify-center mb-2"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              >
                <span className="text-2xl text-white">&#x646;&#x650;</span>
              </motion.div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            >
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription className="mt-2">
                Step {currentStep} of {TOTAL_STEPS} - {currentStep === 1 && 'Essential Information'}
                {currentStep === 2 && 'Personal Details'}
                {currentStep === 3 && 'Location'}
                {currentStep === 4 && 'Relationship'}
              </CardDescription>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            >
              <Progress value={progress} variant="islamic" className="h-2" />
            </motion.div>
          </CardHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <CardContent className="space-y-6 py-6">
            {/* Step 1: Essential */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  className="space-y-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                  >
                    <Label htmlFor="first_name">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      value={firstName}
                      onChange={handleFirstNameChange}
                      onBlur={() => {
                        // Validate on blur to show error if field is empty or invalid
                        if (firstName.trim()) {
                          const error = validateName(firstName, 'First name')
                          setFirstNameError(error)
                        }
                      }}
                      placeholder="e.g., Mary, Anne-Marie, O'Connor"
                      pattern="[A-Za-z]+(?:[\s'-][A-Za-z]+)*"
                      title="Letters, spaces, hyphens, and apostrophes only"
                      required
                      autoFocus
                      error={!!firstNameError}
                      maxLength={50}
                    />
                    <AnimatePresence mode="wait">
                      {firstNameError ? (
                        <motion.p
                          key="error"
                          className="text-xs text-destructive mt-1.5"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {firstNameError}
                        </motion.p>
                      ) : (
                        <motion.p
                          key="hint"
                          className="text-xs text-muted-foreground mt-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          This will be visible to other users. Letters, spaces, hyphens, and apostrophes only.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                  >
                    <Label htmlFor="last_name">Last Name (Optional)</Label>
                    <Input
                      id="last_name"
                      value={lastName}
                      onChange={handleLastNameChange}
                      onBlur={() => {
                        // Validate on blur only if user has entered something
                        if (lastName.trim()) {
                          const error = validateName(lastName, 'Last name')
                          setLastNameError(error)
                        }
                      }}
                      placeholder="e.g., Smith, O'Brien, Al-Mansouri"
                      pattern="[A-Za-z]+(?:[\s'-][A-Za-z]+)*"
                      title="Letters, spaces, hyphens, and apostrophes only"
                      error={!!lastNameError}
                      maxLength={50}
                    />
                    <AnimatePresence mode="wait">
                      {lastNameError ? (
                        <motion.p
                          key="error"
                          className="text-xs text-destructive mt-1.5"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {lastNameError}
                        </motion.p>
                      ) : (
                        <motion.p
                          key="hint"
                          className="text-xs text-muted-foreground mt-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          Letters, spaces, hyphens, and apostrophes only.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Personalization */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  className="space-y-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                  >
                    <Label htmlFor="date_of_birth">
                      Date of Birth <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      id="date_of_birth"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      onDateChange={(date) => setDateOfBirth(date)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      required
                      autoFocus
                      className="w-full"
                    />
                    <AnimatePresence>
                      {dateOfBirth && (() => {
                        const age = calculateAge(dateOfBirth)
                        return (
                          <motion.p
                            className="text-sm text-primary font-medium mt-2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                          >
                            You are {age} {age === 1 ? 'year' : 'years'} old
                          </motion.p>
                        )
                      })()}
                    </AnimatePresence>
                    <p className="text-xs text-muted-foreground mt-1">
                      You must be <strong>18 years or older</strong> to use this platform. 
                      We use this to verify age requirements and personalize your experience. 
                      Your date of birth is private and won't be shared with other users.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                  >
                    <Label htmlFor="gender">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      required
                      helperText="This helps us tailor content for you"
                      autoFocus
                    >
                      <option value="" disabled>Select gender...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </Select>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                  >
                    <Label htmlFor="marital_status">
                      Marital Status <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      id="marital_status"
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as any)}
                      required
                      helperText="Select your current relationship status"
                    >
                      <option value="" disabled>Select status...</option>
                      <option value="Single">Single</option>
                      <option value="Engaged">Engaged</option>
                      <option value="Researching">Researching</option>
                    </Select>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  className="space-y-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                  >
                    <Label htmlFor="country">Country (Optional)</Label>
                    <Select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      helperText="Helps us provide localized content and community features"
                      autoFocus
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </Select>
                  </motion.div>
                  <AnimatePresence>
                    {country && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        <Label htmlFor="city">City (Optional)</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter your city"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="rounded-lg bg-primary/5 border border-primary/20 p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                  >
                    <p className="text-sm text-muted-foreground">
                      <strong>Privacy Note:</strong> Your location information helps us personalize your experience. 
                      You can change your privacy settings later in your profile.
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 4: Relationship */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  className="space-y-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                  >
                    <Label htmlFor="partner_name">Partner's Name (Optional)</Label>
                    <Input
                      id="partner_name"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Your future spouse's name"
                      autoFocus
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                  >
                    <Label htmlFor="wedding_date">Wedding Date (Optional)</Label>
                    <Input
                      id="wedding_date"
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                  >
                    <Label>Is your partner also using this app?</Label>
                    <div className="flex gap-4 mt-2">
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant={partnerUsingApp === true ? "default" : "outline"}
                          onClick={() => setPartnerUsingApp(true)}
                          className="flex-1 w-full"
                        >
                          Yes
                        </Button>
                      </motion.div>
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant={partnerUsingApp === false ? "default" : "outline"}
                          onClick={() => {
                            setPartnerUsingApp(false)
                            setPartnerEmail('')
                          }}
                          className="flex-1 w-full"
                        >
                          No
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                  <AnimatePresence>
                    {partnerUsingApp === true && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        <Label htmlFor="partner_email">
                          Partner's Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="partner_email"
                          type="email"
                          value={partnerEmail}
                          onChange={(e) => setPartnerEmail(e.target.value)}
                          placeholder="partner@example.com"
                          required={partnerUsingApp === true}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          We'll send them an invitation to link your accounts and share progress
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
              >
                <motion.div
                  animate={{ x: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </motion.div>
                Back
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  'Saving...'
                ) : currentStep === TOTAL_STEPS ? (
                  <>
                    Complete <Check className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next{' '}
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                      className="inline-block"
                    >
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </motion.div>
                  </>
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </form>
      </Card>
      </motion.div>
    </div>
  )
}
