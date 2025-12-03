'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Flag, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { contributionsApi, type Contribution, type VerifyContributionData } from '@/lib/api/contributions';
import { toast } from 'sonner';

interface VerificationInterfaceProps {
  contribution: Contribution;
  onVerified?: () => void;
}

const verdictOptions = [
  { value: 'approved', label: 'Approve', icon: CheckCircle, color: 'text-green-600' },
  { value: 'rejected', label: 'Reject', icon: XCircle, color: 'text-red-600' },
  { value: 'needs_review', label: 'Needs Review', icon: AlertCircle, color: 'text-orange-600' },
  { value: 'flagged', label: 'Flag', icon: Flag, color: 'text-purple-600' },
] as const;

export function VerificationInterface({ contribution, onVerified }: VerificationInterfaceProps) {
  const [verdict, setVerdict] = useState<VerifyContributionData['verdict'] | null>(null);
  const [comment, setComment] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(0.8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verdict) {
      toast.error('Please select a verdict');
      return;
    }

    try {
      setIsSubmitting(true);

      const data: VerifyContributionData = {
        verdict,
        comment: comment || null,
        confidenceScore: verdict === 'approved' ? confidenceScore : null,
      };

      const response = await contributionsApi.verifyContribution(contribution.id, data);

      if (response.success) {
        toast.success(`Contribution ${verdict} successfully`);
        if (onVerified) {
          onVerified();
        }
        // Reset form
        setVerdict(null);
        setComment('');
        setConfidenceScore(0.8);
      } else {
        toast.error(response.error || 'Failed to verify contribution');
      }
    } catch (error) {
      toast.error('Failed to verify contribution');
      console.error('Error verifying contribution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Contribution</CardTitle>
        <CardDescription>
          Review and verify this street contribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Verdict Selection */}
          <div className="space-y-2">
            <Label>Verdict</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {verdictOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = verdict === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVerdict(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${option.color}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confidence Score (only for approved) */}
          {verdict === 'approved' && (
            <div className="space-y-2">
              <Label htmlFor="confidence">
                Confidence Score: {confidenceScore.toFixed(2)}
              </Label>
              <Input
                id="confidence"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={confidenceScore}
                onChange={(e) => setConfidenceScore(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low (0.0)</span>
                <span>High (1.0)</span>
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <textarea
              id="comment"
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Add verification comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!verdict || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Verification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

