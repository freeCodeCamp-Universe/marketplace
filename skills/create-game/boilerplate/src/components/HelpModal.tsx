import Modal from "./Modal";

interface Props {
  onClose: () => void;
}

export default function HelpModal({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      {/* REPLACE: add game rules here */}
      <div className="help-section">
        <h3 className="help-heading">help heading</h3>
        <p>help text for heading</p>
      </div>
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </Modal>
  );
}
