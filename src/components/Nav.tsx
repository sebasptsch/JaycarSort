import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'preact/compat';
import NewFileModal from './NewFileModal';
export default function Nav() {
  /**
   * Used to change and toggle the visibility of the navigation buttons on a mobile device.
   */
  const [navbarActive, setNavbarActive] = React.useState(false);

  return (
    <nav
      className="navbar is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item" href="/">
            <img
              src="./dist/jclarge.png"
              height="28"
              width="86"
              alt="Jaycar Logo"
            />
          </a>
          <h4 className="navbar-item is-size-4">Stock Locator</h4>

          <a
            role="button"
            className={`navbar-burger ${navbarActive ? 'is-active' : ''}`}
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
            onClick={() => {
              setNavbarActive((prev) => !prev);
            }}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className={`navbar-menu ${navbarActive ? 'is-active' : ''}`}>
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <NewFileModal />
                <button
                  className="button"
                  onClick={() => {
                    // Check to see if the site is in full-screen mode and toggle
                    !document.fullscreenElement
                      ? document.documentElement.requestFullscreen()
                      : document.exitFullscreen();
                  }}
                >
                  <FontAwesomeIcon icon={faExpand} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
