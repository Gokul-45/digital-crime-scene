package com.crimescene.algorithms;

import org.springframework.stereotype.Component;
import java.util.*;

/**
 * ============================================================
 * DIJKSTRA'S SHORTEST PATH ALGORITHM
 * ============================================================
 * Used for finding the shortest escape route a suspect could
 * take from the crime scene through a weighted location graph.
 *
 * Time Complexity: O((V + E) log V)
 * Space Complexity: O(V)
 *
 * V = number of locations (vertices)
 * E = number of connections (edges)
 * ============================================================
 */
@Component
public class DijkstraAlgorithm {

    /**
     * Represents a node in the graph (a location on the map)
     */
    public static class GraphNode {
        public final String id;
        public final String name;
        public final double latitude;
        public final double longitude;
        public final Map<String, Double> neighbors; // neighbor_id -> weight/distance

        public GraphNode(String id, String name, double latitude, double longitude) {
            this.id = id;
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
            this.neighbors = new HashMap<>();
        }

        public void addNeighbor(String neighborId, double weight) {
            this.neighbors.put(neighborId, weight);
        }
    }

    /**
     * Result container holding shortest distances and the path
     */
    public static class PathResult {
        public final List<String> path;          // ordered list of node IDs
        public final double totalDistance;        // sum of edge weights
        public final Map<String, Double> distances; // distance from source to each node
        public final boolean pathFound;

        public PathResult(List<String> path, double totalDistance,
                          Map<String, Double> distances, boolean pathFound) {
            this.path = path;
            this.totalDistance = totalDistance;
            this.distances = distances;
            this.pathFound = pathFound;
        }
    }

    /**
     * Run Dijkstra from sourceId to targetId on the provided graph.
     *
     * @param graph     Map of nodeId -> GraphNode
     * @param sourceId  Starting location (crime scene)
     * @param targetId  Destination (suspected escape point)
     * @return PathResult with shortest path and distances
     */
    public PathResult findShortestPath(Map<String, GraphNode> graph,
                                       String sourceId,
                                       String targetId) {

        // Distance map: infinity for all nodes except source
        Map<String, Double> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>(); // for path reconstruction

        for (String nodeId : graph.keySet()) {
            dist.put(nodeId, Double.MAX_VALUE);
            prev.put(nodeId, null);
        }
        dist.put(sourceId, 0.0);

        // Priority queue: (distance, nodeId) — min-heap
        PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> a[0]));
        Map<String, Integer> indexMap = new HashMap<>();
        List<String> nodeList = new ArrayList<>(graph.keySet());
        for (int i = 0; i < nodeList.size(); i++) {
            indexMap.put(nodeList.get(i), i);
        }
        pq.offer(new double[]{0.0, indexMap.get(sourceId)});

        Set<String> visited = new HashSet<>();

        while (!pq.isEmpty()) {
            double[] current = pq.poll();
            int nodeIdx = (int) current[1];
            String u = nodeList.get(nodeIdx);

            if (visited.contains(u)) continue;
            visited.add(u);

            if (u.equals(targetId)) break; // Found target — early exit

            GraphNode node = graph.get(u);
            if (node == null) continue;

            // Relax edges
            for (Map.Entry<String, Double> neighbor : node.neighbors.entrySet()) {
                String v = neighbor.getKey();
                double weight = neighbor.getValue();

                if (!visited.contains(v)) {
                    double alt = dist.get(u) + weight;
                    if (alt < dist.getOrDefault(v, Double.MAX_VALUE)) {
                        dist.put(v, alt);
                        prev.put(v, u);
                        Integer vIdx = indexMap.get(v);
                        if (vIdx != null) {
                            pq.offer(new double[]{alt, vIdx});
                        }
                    }
                }
            }
        }

        // Reconstruct path from target back to source
        List<String> path = new ArrayList<>();
        String step = targetId;
        boolean pathFound = dist.get(targetId) < Double.MAX_VALUE;

        if (pathFound) {
            while (step != null) {
                path.add(0, step);
                step = prev.get(step);
            }
        }

        return new PathResult(path, pathFound ? dist.get(targetId) : -1, dist, pathFound);
    }

    /**
     * Build a sample graph from a list of locations.
     * Edges are created between nearby locations using Euclidean distance.
     */
    public Map<String, GraphNode> buildGraphFromLocations(List<LocationPoint> points,
                                                           double maxConnectionDistKm) {
        Map<String, GraphNode> graph = new HashMap<>();

        for (LocationPoint pt : points) {
            graph.put(pt.id, new GraphNode(pt.id, pt.name, pt.lat, pt.lng));
        }

        // Connect nearby nodes
        List<LocationPoint> list = new ArrayList<>(points);
        for (int i = 0; i < list.size(); i++) {
            for (int j = i + 1; j < list.size(); j++) {
                LocationPoint a = list.get(i);
                LocationPoint b = list.get(j);
                double distKm = haversineDistance(a.lat, a.lng, b.lat, b.lng);

                if (distKm <= maxConnectionDistKm) {
                    graph.get(a.id).addNeighbor(b.id, distKm);
                    graph.get(b.id).addNeighbor(a.id, distKm);
                }
            }
        }
        return graph;
    }

    /**
     * Haversine formula — calculate real-world distance between two lat/lng points.
     * Returns distance in kilometers.
     */
    public static double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /** Simple DTO for location points */
    public record LocationPoint(String id, String name, double lat, double lng) {}
}
