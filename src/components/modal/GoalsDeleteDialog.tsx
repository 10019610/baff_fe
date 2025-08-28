import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/modal.tsx';
import type { GetGoalListResponse } from '../../types/Goals.api.type.ts';
import { Button } from '../ui/button.tsx';

interface GoalsDeleteDialogProps {
  deleteGoalId: string;
  onClickCloseDelete: () => void;
  isDeleteModalOpen: boolean;
  goalList: GetGoalListResponse[];
  handleGoalDelete: (goalsId: string) => void
}

/**
 *
 * @constructor
 */
const GoalsDeleteDialog = ({
                             deleteGoalId,
                             onClickCloseDelete,
                             isDeleteModalOpen,
                             goalList,
                             handleGoalDelete,
                           }: GoalsDeleteDialogProps) => {
  return (
    <Modal isOpen={isDeleteModalOpen} onClose={onClickCloseDelete}>
      <ModalHeader>
        <ModalTitle>목표 삭제 확인</ModalTitle>
      </ModalHeader>
      <ModalContent>
        {deleteGoalId && goalList.find(goal => goal.goalsId === deleteGoalId) && (
          <div>
            목표: <strong>{goalList.find(goal => goal.goalsId === deleteGoalId)?.title}</strong>
            <br />
            <br />
            <span className="text-lg font-bold">목표를 정말 삭제하시겠습니까?</span>
            <br />
            <span className="text-muted-foreground text-sm">삭제된 목표는 복구할 수 없습니다.</span>
          </div>
        )}
      </ModalContent>
      <div className="flex justify-end gap-2 m-4">
        <Button variant="outline" onClick={() => handleGoalDelete(deleteGoalId)} className="text-red-600 border-red-600">삭제</Button>
        <Button variant="outline" onClick={onClickCloseDelete}>취소</Button>
      </div>
    </Modal>

    // <AlertDialog open={deleteGoalId != null} onOpenChange={onClickCloseDelete}>
    //   <AlertDialogContent>
    //     <AlertDialogHeader>
    //       <AlertDialogTitle>목표 삭제 확인</AlertDialogTitle>
    //       <AlertDialogDescription>
    //
    //       </AlertDialogDescription>
    //     </AlertDialogHeader>
    //     <AlertDialogFooter>
    //       <AlertDialogCancel onClick={onClickCloseDelete}>
    //         취소
    //       </AlertDialogCancel>
    //     </AlertDialogFooter>
    //   </AlertDialogContent>
    // </AlertDialog>
  );
};

export default GoalsDeleteDialog;
