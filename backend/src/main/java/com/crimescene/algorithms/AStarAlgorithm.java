package com.crimescene.algorithms;

import org.springframework.stereotype.Component;
import java.util.*;

/**
 * ============================================================
 * A* (A-STAR) PATHFINDING ALGORITHM
 * ============================================================
 * An informed best-first search using a heuristic to efficiently
 * find the optimal escape route for a suspect.
 *
 * f(n) = g(n) + h(n)
 *   g(n) = actual cost from start to node n
 *   h(n) = heuristic estimate from n to goal (Haversine)
 *
 * Advantages over Dijkstra:
 *   - Directionally guided → faster in large graphs
 *   - Same optimality guarantee with admissible heuristic
 *
 * Time Complexity: O(E log V) in practice
 * ============================================================
 */
@Component
public class AStarAlgorithm {

    /**
     * Node in the A* open set with f, g scores
     */
    private static class AStarNode implements Comparable<AStarNode> {
        final String id;
        double g; // cost from start
        double f; // g + heuristic

        AStarNode(String id, double g, double f) {
            this.id = id;
            this.g = g;
            this.f = f;
        }

        @Override
        public int compareTo(AStarNode other) {
            return Double.compare(this.f, other.f);
        }
    }

    /**
     * Run A* from source to target.
     *
     * @param graph     location graph (nodeId -> neighbors with weights)
     * @param coords    lat/lng of each node (nodeId -> [lat, lng])
     * @param sourceId  start node
     * @param targetId  end node
     */
    public DijkstraAlgorithm.PathResult findPath(
            Map<String, Map<String, Double>> graph,
            Map<String, double[]> coords,
            String sourceId,
            String targetId) {

        double[] targetCoords = coords.get(targetId);
        if (targetCoords == null) {
            return new DijkstraAlgorithm.PathResult(List.of(), -1, Map.of(), false);
        }

        // g: best known cost from source to node
        Map<String, Double> g = new HashMap<>();
        // came_from: for path reconstruction
        Map<String, String> cameFrom = new HashMap<>();

        for (String nodeId : graph.keySet()) {
            g.put(nodeId, Double.MAX_VALUE);
        }
        g.put(sourceId, 0.0);

        PriorityQueue<AStarNode> openSet = new PriorityQueue<>();
        openSet.offer(new AStarNode(sourceId, 0, heuristic(coords, sourceId, targetId)));

        Set<String> closedSet = new HashSet<>();

        while (!openSet.isEmpty()) {
            AStarNode current = openSet.poll();

            if (current.id.equals(targetId)) {
                // Reconstruct path
                List<String> path = reconstructPath(cameFrom, targetId);
                return new DijkstraAlgorithm.PathResult(path, g.get(targetId), g, true);
            }

            if (closedSet.contains(current.id)) continue;
            closedSet.add(current.id);

            Map<String, Double> neighbors = graph.getOrDefault(current.id, Map.of());
            for (Map.Entry<String, Double> neighborEntry : neighbors.entrySet()) {
                String neighborId = neighborEntry.getKey();
                double edgeWeight = neighborEntry.getValue();

                if (closedSet.contains(neighborId)) continue;

                double tentativeG = g.getOrDefault(current.id, Double.MAX_VALUE) + edgeWeight;

                if (tentativeG < g.getOrDefault(neighborId, Double.MAX_VALUE)) {
                    cameFrom.put(neighborId, current.id);
                    g.put(neighborId, tentativeG);
                    double fScore = tentativeG + heuristic(coords, neighborId, targetId);
                    openSet.offer(new AStarNode(neighborId, tentativeG, fScore));
                }
            }
        }

        // No path found
        return new DijkstraAlgorithm.PathResult(List.of(), -1, g, false);
    }

    /**
     * Heuristic: straight-line Haversine distance to goal.
     * This is admissible (never overestimates) since actual roads are ≥ straight line.
     */
    private double heuristic(Map<String, double[]> coords, String nodeId, String targetId) {
        double[] nodePt = coords.get(nodeId);
        double[] targetPt = coords.get(targetId);
        if (nodePt == null || targetPt == null) return 0;
        return DijkstraAlgorithm.haversineDistance(nodePt[0], nodePt[1], targetPt[0], targetPt[1]);
    }

    /** Reconstruct the path from start to end by backtracking via cameFrom map */
    private List<String> reconstructPath(Map<String, String> cameFrom, String current) {
        List<String> path = new ArrayList<>();
        while (current != null) {
            path.add(0, current);
            current = cameFrom.get(current);
        }
        return path;
    }
}
