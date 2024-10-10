new Vue({
    el: '#app',
    data: {
        packs: [],
        selectedPack: null,
        totalBeatmaps: 0,  // Total number of beatmaps in all packs
        unclearedBeatmaps: 0,  // Remaining unticked beatmaps
        progress: 0,
        loadedBeatmapIds: [] // New property to store beatmap IDs from the file
    },
    created() {
        this.fetchPacks();
    },
    methods: {
        async fetchPacks() {
            try {
                const response = await fetch('packs.json');
                const data = await response.json();

                // Sort packs numerically based on the numeric part of packName
                this.packs = data.sort((a, b) => {
                    const numA = parseInt(a.packName.replace(/\D/g, ''));
                    const numB = parseInt(b.packName.replace(/\D/g, ''));
                    return numA - numB;
                });

                // Calculate total beatmaps and set uncleared beatmaps initially
                this.totalBeatmaps = data.reduce((total, pack) => total + pack.beatmaps.length, 0);
                this.unclearedBeatmaps = this.totalBeatmaps; // Set uncleared beatmaps equal to total at start
            } catch (error) {
                console.error('Error fetching packs:', error);
            }
        },
        toggleBeatmaps(pack) {
            if (this.selectedPack && this.selectedPack.packName === pack.packName) {
                this.selectedPack = null; // Close if already selected
            } else {
                this.selectedPack = pack; // Set the selected pack
            }
            this.updateProgress(); // Update progress when a pack is toggled
        },
        updateProgress() {
            const checkedBeatmaps = this.packs.reduce((total, pack) => {
                return total + pack.beatmaps.filter(b => b.checked).length;
            }, 0);
            this.unclearedBeatmaps = this.totalBeatmaps - checkedBeatmaps; // Update uncleared beatmaps
            this.progress = (this.totalBeatmaps > 0) ? (checkedBeatmaps / this.totalBeatmaps) * 100 : 0;
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    this.loadedBeatmapIds = new Set(content.split('\n').map(id => id.trim()).filter(id => id));
                };
                reader.readAsText(file);
            }
        },
        loadBeatmapIds() {
            const loadedSet = this.loadedBeatmapIds;

            // Reset all checkboxes to false before applying new loaded data
            this.packs.forEach(pack => {
                pack.beatmaps.forEach(beatmap => {
                    beatmap.checked = loadedSet.has(beatmap.beatmap_id.toString());
                });
            });
            this.updateProgress(); // Update progress after loading IDs
        },
        areAnyBeatmapsChecked(pack) {
            return pack.beatmaps.some(beatmap => beatmap.checked);
        },
        areSomeBeatmapsChecked(pack) {
            return pack.beatmaps.filter(beatmap => beatmap.checked).length > 0 && !this.areAllBeatmapsChecked(pack);
        },
        areAllBeatmapsChecked(pack) {
            return pack.beatmaps.every(beatmap => beatmap.checked);
        },
        exportUncleared() {
            // Create text content for unchecked beatmaps with pack names
            let textContent = '';
            this.packs.forEach(pack => {
                const uncheckedBeatmaps = pack.beatmaps.filter(b => !b.checked).map(b => b.beatmap_id);
                if (uncheckedBeatmaps.length > 0) {
                    textContent += `Pack Name: ${pack.packName}\n${uncheckedBeatmaps.join(',')}\n\n`;
                }
            });

            // Create a downloadable text file
            const blob = new Blob([textContent], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'uncleared_beatmaps.txt';
            link.click();

            // Cleanup
            URL.revokeObjectURL(link.href);
        }
    }
});
