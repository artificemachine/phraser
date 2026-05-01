use clap::Parser;

#[derive(Parser, Debug, Clone, Default)]
#[command(name = "phraser", about = "phraser - Speech to Text")]
pub struct CliArgs {
    /// Start with the main window hidden
    #[arg(long)]
    pub start_hidden: bool,

    /// Disable the system tray icon
    #[arg(long)]
    pub no_tray: bool,

    /// Toggle transcription on/off (sent to running instance)
    #[arg(long)]
    pub toggle_transcription: bool,

    /// Toggle transcription with post-processing on/off (sent to running instance)
    #[arg(long)]
    pub toggle_post_process: bool,

    /// Cancel the current operation (sent to running instance)
    #[arg(long)]
    pub cancel: bool,

    /// Enable debug mode with verbose logging
    #[arg(long)]
    pub debug: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn command_name_is_phraser() {
        let cmd = CliArgs::command();
        assert_eq!(cmd.get_name(), "phraser");
    }

    #[test]
    fn about_contains_phraser() {
        let cmd = CliArgs::command();
        let about = cmd.get_about().map(|a| a.to_string()).unwrap_or_default();
        assert!(
            about.contains("phraser"),
            "CLI about text should contain 'phraser', got: {}",
            about
        );
    }

    #[test]
    fn default_has_all_flags_false() {
        let args = CliArgs::default();
        assert!(!args.start_hidden);
        assert!(!args.no_tray);
        assert!(!args.toggle_transcription);
        assert!(!args.toggle_post_process);
        assert!(!args.cancel);
        assert!(!args.debug);
    }

    #[test]
    fn parses_toggle_transcription() {
        let args = CliArgs::parse_from(["phraser", "--toggle-transcription"]);
        assert!(args.toggle_transcription);
        assert!(!args.toggle_post_process);
    }

    #[test]
    fn parses_multiple_flags() {
        let args = CliArgs::parse_from(["phraser", "--start-hidden", "--no-tray", "--debug"]);
        assert!(args.start_hidden);
        assert!(args.no_tray);
        assert!(args.debug);
        assert!(!args.toggle_transcription);
    }
}
