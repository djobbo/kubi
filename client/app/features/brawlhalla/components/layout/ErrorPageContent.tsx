import { SiDiscord as DiscordIcon, SiGithub as GithubIcon } from '@icons-pack/react-simple-icons';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useNavigate } from '@tanstack/react-router';

import { SafeImage } from '@/features/brawlhalla/components/Image';
import { Button } from '@/ui/components/button';

import { SectionTitle } from './SectionTitle';

interface ErrorPageContentProps {
  title?: string;
  statusCode?: 404 | 500;
}

export const ErrorPageContent = ({
  title = t`Oops, something went wrong`,
  statusCode,
}: ErrorPageContentProps) => {
  const navigate = useNavigate();

  return (
    <div>
      <SectionTitle className="text-center">{title}</SectionTitle>
      {!!statusCode && (
        <SafeImage
          src={`/assets/images/errors/error-${statusCode}.png`}
          alt={t`${statusCode} Error`}
          containerClassName="w-full h-full min-h-[240px] md:min-h-[400px]"
          className="object-contain object-center"
        />
      )}
      <div className="flex flex-col justify-center items-center gap-4">
        <Button onClick={() => navigate({ to: '/' })}>
          <Trans>Bring me home</Trans>
        </Button>
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window?.open('/discord', '_blank', 'noreferrer')?.focus();
            }}
            className="flex items-center gap-2"
          >
            <DiscordIcon size={16} /> <Trans>Report bug</Trans>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window?.open('/github', '_blank', 'noreferrer')?.focus();
            }}
            className="flex items-center gap-2"
          >
            <GithubIcon size={16} /> <Trans>Contribute</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
};
