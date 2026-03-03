'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from '@/lib/i18n/LanguageContext';

const SignIn = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: { email: '', password: '' },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if (result.success) { router.push('/'); return; }
            toast.error(t('sign_in_failed'), { description: result.error ?? t('invalid_credentials') });
        } catch (e) {
            toast.error(t('sign_in_failed'), { description: e instanceof Error ? e.message : t('invalid_credentials') });
        }
    }

    return (
        <>
            <h1 className="form-title">{t('sign_in_title')}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label={t('email_label')}
                    placeholder="your@email.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: t('email_label') + ' required',
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
                    validation={{ required: t('password_label') + ' required', minLength: 8 }}
                />
                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? t('signing_in_btn') : t('sign_in_btn')}
                </Button>
                <FooterLink text={t('no_account')} linkText={t('create_account')} href="/sign-up" />
            </form>
        </>
    );
};
export default SignIn;
