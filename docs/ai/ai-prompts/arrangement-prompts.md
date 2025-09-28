Here are optimized prompts for Claude Code to analyze and implement your arrangement system:

## Initial Analysis Prompt
Analyze the current CoreTet codebase architecture and identify the best integration points for a new "Arrangement System" feature, which can be found at docs/features/arrangement_system_spec.md

This system allows users to:

1. Mark sections of audio files with microsecond precision (intro, verse, chorus, etc.)
2. Create custom sequences of these sections for non-destructive playback  
3. Apply automatic crossfading between sections

Review the existing audio handling, state management, and UI components. Suggest:
- Where to place the new ArrangementEngine class
- How to integrate with current audio playback systems
- Required changes to existing components
- Database schema additions needed
- Potential conflicts with current architecture

Focus on clean integration rather than replacing existing functionality.

## Core Implementation Prompts
### Audio Engine Implementation
Implement the ArrangementEngine class based on the specification document. Key requirements:

- Use Web Audio API for microsecond-precision scheduling
- Support MP3, WAV, M4A, OGG file formats
- Create section management with startTime/endTime tracking
- Implement basic linear crossfading for MVP
- Include simple onset-based tempo detection
- Ensure seamless playback across section boundaries

Follow existing code patterns in the project. Add comprehensive error handling and logging. Make it work with the current audio playback system without breaking existing functionality.

### UI Component Development
Create the arrangement system UI components:

1. **SectionLibrary** - Displays defined sections with drag handles
2. **ArrangementBuilder** - Drop zone for sequencing sections
3. **WaveformEditor** - Integrates WaveSurfer.js for section marking
4. **CrossfadeControls** - Simple duration and type controls

Requirements:
- Follow existing CoreTet UI patterns and styling
- Use current state management approach
- Mobile-responsive design
- Drag-and-drop using SortableJS or similar
- Real-time updates during playback

Integrate with existing audio player without disrupting current functionality.

### Database Integration
Design and implement the database schema for the arrangement system:

- Table for storing section definitions
- Table for arrangement sequences
- Relationship to existing track/audio tables
- JSON fields for flexible metadata storage
- Indexes for performance

Consider:
- How arrangements relate to existing user/project structure
- Version control for arrangement iterations
- Sharing permissions for collaborative arrangements
- Migration strategy that doesn't break existing data

Provide the SQL migration files and any required API endpoint changes.

## Testing & Validation Prompts
### Performance Testing
Implement comprehensive testing for the arrangement system:

1. **Unit tests** for ArrangementEngine core functionality
2. **Integration tests** for UI component interactions
3. **Performance benchmarks** for audio processing  
4. **Browser compatibility** testing across Chrome, Firefox, Safari

Focus on:
- Memory usage with large audio files
- Crossfade quality validation
- Timing precision verification
- Error handling edge cases

Create automated tests that validate microsecond timing accuracy and seamless playback quality.
### User Experience Validation
Create a demo implementation that showcases the arrangement system:

- Load a sample audio file
- Auto-detect or manually define 4-5 sections
- Create 2-3 different arrangements
- Demonstrate seamless playback with crossfades
- Show export/import functionality

Make it interactive enough to validate the core user workflow. Include performance monitoring to identify any bottlenecks or quality issues.

## Advanced Feature Planning
### Collaboration Architecture
Design the real-time collaboration architecture for arrangements:

- WebSocket integration for live editing
- Operational Transform for concurrent modifications
- Presence awareness (who's editing what section)
- Comment system anchored to timeline positions
- Version history with branching

Plan the data flow, conflict resolution, and synchronization strategy. Consider how multiple users can edit arrangements simultaneously without data corruption. Design for future scaling to 10+ simultaneous collaborators.

### Mobile Optimization
Analyze mobile performance requirements and create optimization strategy:

- Touch-friendly section editing
- Gesture-based arrangement modification
- Battery usage optimization
- Offline capability with sync
- Progressive loading for large files

Review current mobile experience and identify arrangement-specific optimizations needed. Consider Web Audio API limitations on iOS and Android.

## Quality Assurance Prompts

### Code Review Simulation
Perform a thorough code review of the arrangement system implementation:

- Architecture adherence to existing patterns
- Performance implications and potential bottlenecks
- Security considerations for audio file handling
- Accessibility compliance
- Code maintainability and documentation quality

Suggest improvements and identify any potential issues before production deployment.

### Integration Testing
Validate the arrangement system integration with existing CoreTet features:

- Audio playbook compatibility
- State management consistency
- UI component interaction
- Database transaction safety
- Error propagation and handling

Ensure the new feature enhances rather than disrupts the existing user experience.

## Pro Tips for Claude Code Usage
Sequential Implementation Strategy:

Start with analysis - Let Claude Code understand your current architecture
Implement core engine - Get the audio processing working first
Build UI components - Create the visual interface
Add database layer - Persist arrangements and sections
Test & optimize - Validate performance and user experience

Effective Follow-up Prompts:
"The implementation looks good, but I'm concerned about memory usage with large files. Optimize the audio buffer management."

"Add error handling for unsupported audio formats and network failures during file loading."

"Make the UI more responsive by adding loading states and progress indicators."
These prompts are designed to work with Claude Code's strengths - architectural analysis, systematic implementation, and comprehensive testing. They'll help you build the arrangement system incrementally while maintaining code quality!