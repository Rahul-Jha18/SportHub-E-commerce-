function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} SportHub — All Rights Reserved</p>
        <p>
          Built for sports lovers •{" "}
          <a href="#top" onClick={() => window.scrollTo(0, 0)}>
            Back to top
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
