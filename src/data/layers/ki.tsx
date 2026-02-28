/**
 * Ki Layer — passive Ki energy generation with strategic upgrades.
 *
 * Design rules:
 *  - Ki is generated PASSIVELY via the game loop (layer.on "update").
 *  - There are NO click-to-generate buttons.
 *  - Players make strategic decisions by purchasing upgrades that boost the
 *    passive Ki/s rate.
 *
 * @module
 * @hidden
 */
import { createUpgrade } from "features/clickables/upgrade";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { createResourceTooltip } from "features/trees/tree";
import { createLayer } from "game/layers";
import { createCostRequirement } from "game/requirements";
import type { DecimalSource } from "util/bignum";
import Decimal, { format } from "util/bignum";
import { renderRow } from "util/vue";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { computed } from "vue";
import { createLayerTreeNode } from "../common";

const id = "ki";

/** The Ki layer — the first layer of Idle Dragon Ball. */
const layer = createLayer(id, () => {
    const name = "Ki";
    /** Gold/energy colour used throughout the Ki layer UI. */
    const color = "#FFD700";

    // -------------------------------------------------------------------------
    // Resource
    // -------------------------------------------------------------------------

    /**
     * Ki is the primary resource of the game.
     * It accumulates passively every tick — no clicking required.
     */
    const ki = createResource<DecimalSource>(0, "ki");

    // -------------------------------------------------------------------------
    // Upgrades — one-time strategic decisions that boost passive Ki/s
    // -------------------------------------------------------------------------

    /**
     * Upgrade 1: Ki Sensing
     * Cost: 10 Ki
     * Effect: doubles the passive Ki/s rate.
     */
    const upgradeSensing = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: ki,
            cost: 10
        })),
        display: {
            title: "Ki Sensing",
            description: "Learn to sense energy in the air. Doubles passive Ki gain.",
            effectDisplay: computed(() =>
                upgradeSensing.bought.value ? `×${format(kiSensingMultiplier.value)} Ki/s` : "×2 Ki/s"
            )
        }
    }));

    /**
     * Upgrade 2: Ki Control
     * Cost: 100 Ki — unlocked after Ki Sensing.
     * Effect: triples the passive Ki/s rate (stacks multiplicatively with other upgrades).
     */
    const upgradeControl = createUpgrade(() => ({
        // Only visible once Ki Sensing has been purchased
        visibility: computed(() => upgradeSensing.bought.value),
        requirements: createCostRequirement(() => ({
            resource: ki,
            cost: 100
        })),
        display: {
            title: "Ki Control",
            description: "Master the flow of your energy. Triples passive Ki gain.",
            effectDisplay: computed(() =>
                upgradeControl.bought.value ? `×${format(kiControlMultiplier.value)} Ki/s` : "×3 Ki/s"
            )
        }
    }));

    /**
     * Upgrade 3: Power Level Rising
     * Cost: 1,000 Ki — unlocked after Ki Control.
     * Effect: multiplies the passive Ki/s rate by ×5.
     */
    const upgradePowerLevel = createUpgrade(() => ({
        // Only visible once Ki Control has been purchased
        visibility: computed(() => upgradeControl.bought.value),
        requirements: createCostRequirement(() => ({
            resource: ki,
            cost: 1000
        })),
        display: {
            title: "Power Level Rising",
            description: "Your power level is over 9000! Multiplies passive Ki gain by ×5.",
            effectDisplay: computed(() =>
                upgradePowerLevel.bought.value
                    ? `×${format(powerLevelMultiplier.value)} Ki/s`
                    : "×5 Ki/s"
            )
        }
    }));

    // -------------------------------------------------------------------------
    // Computed multipliers (one per upgrade for clarity)
    // -------------------------------------------------------------------------

    /** ×2 multiplier from Ki Sensing, active after purchase. */
    const kiSensingMultiplier = computed(() => (upgradeSensing.bought.value ? 2 : 1));
    /** ×3 multiplier from Ki Control, active after purchase. */
    const kiControlMultiplier = computed(() => (upgradeControl.bought.value ? 3 : 1));
    /** ×5 multiplier from Power Level Rising, active after purchase. */
    const powerLevelMultiplier = computed(() => (upgradePowerLevel.bought.value ? 5 : 1));

    /**
     * Total passive Ki gain per second.
     * Base: 1 Ki/s — multiplied by each purchased upgrade.
     * The player never clicks to generate Ki; this value is applied each tick.
     */
    const kiGain = computed(() =>
        new Decimal(1)
            .times(kiSensingMultiplier.value)
            .times(kiControlMultiplier.value)
            .times(powerLevelMultiplier.value)
    );

    // -------------------------------------------------------------------------
    // Game loop — passive generation (no clicks involved)
    // -------------------------------------------------------------------------

    /** Every game tick, passively add kiGain × elapsed seconds to the ki resource. */
    layer.on("update", diff => {
        ki.value = Decimal.add(ki.value, Decimal.times(kiGain.value, diff));
    });

    // -------------------------------------------------------------------------
    // Tree node — appears on the main layer's tree
    // -------------------------------------------------------------------------

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color
    }));

    /** Tooltip on the tree node shows current Ki amount. */
    addTooltip(treeNode, () => ({
        display: createResourceTooltip(ki),
        pinnable: true
    }));

    // -------------------------------------------------------------------------
    // Layer return — everything that should be persisted or exposed
    // -------------------------------------------------------------------------

    return {
        name,
        color,
        ki,
        kiGain,
        treeNode,
        upgradeSensing,
        upgradeControl,
        upgradePowerLevel,
        display: () => (
            <>
                {/* Main resource display: shows current Ki and passive gain rate */}
                <MainDisplay
                    resource={ki}
                    color={color}
                    effectDisplay={() => `+${format(kiGain.value)} Ki/s`}
                />
                {/* Upgrade row: player strategic decisions to boost passive Ki/s */}
                {renderRow(upgradeSensing, upgradeControl, upgradePowerLevel)}
            </>
        )
    };
});

export default layer;
