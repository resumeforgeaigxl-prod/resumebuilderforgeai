import RoadmapGenerator from '@/components/dashboard/RoadmapGenerator';
import { FeatureGate } from '@/components/pricing/FeatureGate';

export default function RoadmapPage() {
    return (
        <FeatureGate task="roadmap">
            <div className="py-8">
                <RoadmapGenerator />
            </div>
        </FeatureGate>
    );
}
