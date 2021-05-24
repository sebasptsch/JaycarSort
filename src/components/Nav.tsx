import NewFileModal from "./NewFileModal";
export default function Nav() {
  return (
    <div className="is-flex is-flex-align-center m-4">
      <h3 className="is-3 title mb-0">Jaycar Stock Locator</h3>
      <span style={{ flex: 1, justifySelf: "stretch", alignSelf: "stretch" }} />
      {/* <div>Date</div> */}
      <div className="buttons">
        <NewFileModal />
      </div>
    </div>
  );
}
