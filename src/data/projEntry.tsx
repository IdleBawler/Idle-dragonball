import Node from "components/Node.vue";
import Spacer from "components/layout/Spacer.vue";
import { branchedResetPropagation, createTree, Tree } from "features/trees/tree";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import { noPersist } from "game/persistence";
import player, { Player } from "game/player";
import { formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed } from "vue";
import ki from "./layers/ki";

/**
 * Main entry layer for Idle Dragon Ball.
 * This layer hosts the game tree and top-level status displays.
 * It does NOT generate resources itself — all resource generation is
 * handled passively inside each individual layer (e.g. ki.tsx).
 * @hidden
 */
export const main = createLayer("main", () => {
    // A simple tree whose only node is the Ki layer.
    // More layers (Training, Zenkai, etc.) will be added as new nodes here.
    const tree = createTree(() => ({
        nodes: noPersist([[ki.treeNode]]),
        branches: [],
        onReset() {
            // No resources to reset on the main layer itself.
        },
        resetPropagation: branchedResetPropagation
    })) as Tree;

    return {
        name: "Idle Dragon Ball",
        links: tree.links,
        display: () => (
            <>
                {/* Dev / debug status indicators */}
                {player.devSpeed === 0 ? (
                    <div>
                        Game Paused
                        <Node id="paused" />
                    </div>
                ) : null}
                {player.devSpeed != null && player.devSpeed !== 0 && player.devSpeed !== 1 ? (
                    <div>
                        Dev Speed: {player.devSpeed}x
                        <Node id="devspeed" />
                    </div>
                ) : null}
                {player.offlineTime != null && player.offlineTime !== 0 ? (
                    <div>
                        Offline Time: {formatTime(player.offlineTime)}
                        <Node id="offline" />
                    </div>
                ) : null}

                {/* Game introduction */}
                <h2 style="color: #FFD700">🐉 Idle Dragon Ball</h2>
                <p>
                    Your power grows passively. Click a layer node below to begin your training.
                </p>

                <Spacer />

                {/* Layer tree — the player navigates layers from here */}
                {render(tree)}
            </>
        ),
        tree
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, ki];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
