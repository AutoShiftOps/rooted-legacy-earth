import { useNavigate } from "react-router-dom";
import AddPersonForm from "../components/AddPersonForm.jsx";

export default function AddPerson() {
  const navigate = useNavigate();

  return (
    <div className="add-person-page">
      <h2>Add someone to your family tree</h2>
      <p>
        Pin a living relative, or add a deceased ancestor to preserve their
        place in your family's story. Deceased and minor records require a
        short attestation confirming your relationship to them.
      </p>
      <AddPersonForm onCreated={(id) => navigate(`/person/${id}`)} />
    </div>
  );
}
