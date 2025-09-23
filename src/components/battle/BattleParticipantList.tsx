import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Crown } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

import type { BattleParticipant } from '../../types/BattleRoom.api.type';

interface BattleParticipantListProps {
  isOpen: boolean;
  onClose: () => void;
  participants: BattleParticipant[];
  roomName: string;
  isLoading?: boolean;
  hostId: string;
}

const BattleParticipantList = ({
  isOpen,
  onClose,
  participants,
  roomName,
  isLoading,
  hostId,
}: BattleParticipantListProps) => {
  console.log(participants);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">참가자 목록</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{roomName}</p>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          {isLoading
            ? // 로딩 스켈레톤
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))
            : participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex flex-col gap-2 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {participant.userNickName}
                      </span>
                      <div className="flex gap-1.5">
                        {participant.userId === Number(hostId) && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Crown className="h-3 w-3 text-yellow-500" />
                            방장
                          </Badge>
                        )}
                        <Badge
                          variant={participant.ready ? 'default' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {participant.ready ? '준비 완료' : '준비 중'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {participant.ready && (
                    <div className="text-sm text-muted-foreground pl-1">
                      <div className="flex items-center gap-2">
                        <span>
                          목표:{' '}
                          {participant.goalType === 'WEIGHT_LOSS'
                            ? '감량'
                            : '증량'}
                        </span>
                        <span>•</span>
                        <span>목표 체중: {participant.targetValue}kg</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BattleParticipantList;
