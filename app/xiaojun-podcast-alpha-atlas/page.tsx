import type { Metadata } from 'next';
import podcastData from '@/data/xiaojunPodcastAlpha.json';
import XiaojunPodcastAlphaClient, {
  type PodcastData,
} from './XiaojunPodcastAlphaClient';

export const metadata: Metadata = {
  title: 'Zhang Xiaojun Podcast Alpha Atlas',
  description:
    'An interactive investment-alpha atlas of the Zhang Xiaojun Podcast corpus, with episode summaries, hidden insights, thesis maps, charts, and transcript links.',
};

export default function XiaojunPodcastAlphaAtlasPage() {
  return <XiaojunPodcastAlphaClient data={podcastData as PodcastData} />;
}
