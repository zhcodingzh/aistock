'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import { CountrySelectField } from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from '@/lib/i18n/LanguageContext';

const SignUp = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'US',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology'
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if (result.success) { router.push('/'); return; }
            toast.error(t('sign_up_failed'), { description: result.error ?? 'Could not create account.' });
        } catch (e) {
            toast.error(t('sign_up_failed'), { description: e instanceof Error ? e.message : 'Failed to create account.' });
        }
    }

    return (
        <>
            <h1 className="form-title">{t('sign_up_title')}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="fullName"
                    label={t('name_label')}
                    placeholder={t('name_placeholder')}
                    register={register}
                    error={errors.fullName}
                    validation={{ required: 'Full name is required', minLength: 2 }}
                />
                <InputField
                    name="email"
                    label={t('email_label')}
                    placeholder="your@email.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: { value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/, message: 'Invalid email' }
                    }}
                />
                <InputField
                    name="password"
                    label={t('password_label')}
                    placeholder={t('password_placeholder')}
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: 8 }}
                />
                <CountrySelectField
                    name="country"
                    label={t('country_label')}
                    control={control}
                    error={errors.country}
                    required
                />
                <SelectField
                    name="investmentGoals"
                    label={t('investment_goal_label')}
                    placeholder={t('investment_goal_placeholder')}
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                    required
                />
                <SelectField
                    name="riskTolerance"
                    label={t('risk_tolerance_label')}
                    placeholder={t('risk_tolerance_placeholder')}
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                    required
                />
                <SelectField
                    name="preferredIndustry"
                    label={t('preferred_industry_label')}
                    placeholder={t('preferred_industry_placeholder')}
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.preferredIndustry}
                    required
                />
                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? t('signing_up_btn') : t('sign_up_btn')}
                </Button>
                <FooterLink text={t('has_account')} linkText={t('sign_in_link')} href="/sign-in" />
            </form>
        </>
    )
}
export default SignUp;
