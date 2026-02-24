"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Search, Edit, Eye, EyeOff, Calendar, User, Filter } from "lucide-react"
import artPieceService from "@/services/artPiece.service"
import Head from "next/head"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Navbar from "@/components/navbar"

interface Artwork {
  id: string;
  title: string;
  artist: string;
  price: number;
  description: string;
  status: 'visible' | 'disabled';
  uploadDate: string;
  image: string;
  likes: number;
  createdPieces: any[];
}

export default function ArtworksManagement() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)

  const fetchArtworks = async (token : string | null) => {
    try {
      setLoading(true);
      const response = await artPieceService.getAllSellables(404, token);
      
      let artPieces = [];
      if (response.artPieces && Array.isArray(response.artPieces.artPieces)) {
        artPieces = response.artPieces.artPieces;
      } else if (Array.isArray(response.artPieces)) {
        artPieces = response.artPieces;
      } else if (Array.isArray(response)) {
        artPieces = response;
      }

      const transformedArtPieces = artPieces.map((piece: { id: any; title: any; artist: any; price: any; description: any; publishOnMarket: any; createdAt: any; url: any; likedBy: string | any[]; createdPieces: any }) => ({
        id: piece.id,
        title: piece.title,
        artist: piece.artist,
        price: piece.price,
        description: piece.description,
        status: piece.publishOnMarket ? "visible" : "disabled",
        uploadDate: piece.createdAt || new Date().toISOString(),
        image: piece.url || "/placeholder.svg",
        likes: piece.likedBy.length || 0,
        createdPieces: piece.createdPieces || []
      }));

      setArtworks(transformedArtPieces);
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (role === "admin") {
      setIsAdmin(true);
      const token = sessionStorage.getItem("token");
      fetchArtworks(token); // Fetch artworks when component mounts and user is admin
    }
    setCheckedAuth(true);    
  }, []);
  
  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch =
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || artwork.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleEditArtwork = (artwork: any) => {
    setEditingArtwork({ ...artwork })
  }
  const handleSaveArtwork = async () => {
    if (editingArtwork) {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }


        if (!editingArtwork.id) {
          console.error("No artwork ID found");
          return;
        }

        const updateData = {
          title: editingArtwork.title,
          description: editingArtwork.description,
          price: Number(editingArtwork.price),
          publishOnMarket: editingArtwork.status === "visible"
        };


        const result = await artPieceService.editArtPiece(editingArtwork.id.toString(), updateData, token);
        
        // Refresh the artworks list
        const response = await artPieceService.getAllSellables(404, token);
        let artPieces = [];
        if (response.artPieces && Array.isArray(response.artPieces.artPieces)) {
          artPieces = response.artPieces.artPieces;
        } else if (Array.isArray(response.artPieces)) {
          artPieces = response.artPieces;
        } else if (Array.isArray(response)) {
          artPieces = response;
        }

        const transformedArtPieces = artPieces.map((piece: { id: any; title: any; artist: any; price: any; description: any; publishOnMarket: any; createdAt: any; url: any; likedBy: string | any[]; createdPieces: any }) => ({
          id: piece.id,
          title: piece.title,
          artist: piece.artist,
          price: piece.price,
          description: piece.description,
          status: piece.publishOnMarket ? "visible" : "disabled",
          uploadDate: piece.createdAt || new Date().toISOString(),
          image: piece.url || "/placeholder.svg",
          likes: piece.likedBy.length || 0,
          createdPieces: piece.createdPieces || []
        }));

        setArtworks(transformedArtPieces);
        setEditingArtwork(null);
      } catch (error) {
        console.error("Error saving artwork:", error);
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    }
  }
  const toggleArtworkStatus = async (artworkId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Call the toggle API
      await artPieceService.togglePublishArtPiece(artworkId.toString(), token);
      
      // Fetch all products again to get the updated data
      await fetchArtworks(token);
    } catch (error) {
      console.error("Error toggling artwork status:", error);
      setError(error instanceof Error ? error.message : 'Failed to toggle artwork status');
    }
  }
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false); // flag to prevent premature render
  
  if (!checkedAuth) {
    return null; // or a loading spinner if you'd like
  }

  if (!isAdmin) {
    return ( 
      <div className="min-h-screen bg-[#F9F2EA]">
        <Navbar />
        <div className="container mx-auto px-4 py-8 ">
          <p className="text-3xl font-light tracking-wider text-[#8A5A3B] mb-2">
            This is an admin-only page!
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F2EA]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 ">
        <p className="text-3xl font-light tracking-wider text-[#8A5A3B] mb-2">
          LOADING.....
        </p>
      </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Manage Artworks - Art Gallery Admin</title>
      </Head>
      <div className="min-h-screen bg-[#F9F2EA]">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-wider text-[#8A5A3B] mb-2">
              Artwork <span className="font-medium">Management</span>
            </h1>
            <p className="text-[#A67C52]">Manage art pieces and their visibility</p>
          </div>

          <Card className="border-none shadow-sm rounded-none bg-white">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-xl font-medium text-[#8A5A3B]">
                  All Artworks ({filteredArtworks.length})
                </CardTitle>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A67C52]" />
                    <Input
                      placeholder="Search artworks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#E8D7C9] rounded-none focus:border-[#C8977F] focus:ring-[#C8977F] w-full sm:w-64"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-[#E8D7C9] rounded-none focus:border-[#C8977F] focus:ring-[#C8977F] w-full sm:w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E8D7C9]">
                      <TableHead className="text-[#8A5A3B]">Artwork</TableHead>
                      <TableHead className="text-[#8A5A3B]">Artist</TableHead>
                      <TableHead className="text-[#8A5A3B]">Price</TableHead>
                      <TableHead className="text-[#8A5A3B]">Upload Date</TableHead>
                      <TableHead className="text-[#8A5A3B]">Status</TableHead>
                      <TableHead className="text-[#8A5A3B]">Engagement</TableHead>
                      <TableHead className="text-[#8A5A3B] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArtworks.map((artwork) => (
                      <TableRow key={artwork.id} className="border-[#E8D7C9]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16 bg-[#EFE6DC] rounded-none overflow-hidden">
                              <Image
                                src={artwork.image || "/placeholder.svg"}
                                alt={artwork.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-[#8A5A3B]">{artwork.title}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-[#A67C52]">
                            <User className="h-3 w-3" />
                            {artwork.artist}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-[#8A5A3B]">${artwork.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-[#A67C52]">
                            <Calendar className="h-3 w-3" />
                            {new Date(artwork.uploadDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                artwork.status === "visible" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {artwork.status === "visible" ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Visible
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Disabled
                                </>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-[#A67C52]">
                            <div>{artwork.likes} likes</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleArtworkStatus(artwork.id)}
                              className={`rounded-none ${
                                artwork.status === "visible"
                                  ? "border-red-300 text-red-600 hover:bg-red-50"
                                  : "border-green-300 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {artwork.status === "visible" ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditArtwork(artwork)}
                                  className="border-[#C8977F] text-[#C8977F] hover:bg-[#C8977F]/10 rounded-none"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white rounded-none max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-[#8A5A3B]">Edit Artwork</DialogTitle>
                                </DialogHeader>

                                {editingArtwork && (
                                  <div className="space-y-6">
                                    <div className="flex gap-6">
                                      <div className="relative w-32 h-32 bg-[#EFE6DC] rounded-none overflow-hidden">
                                        <Image
                                          src={editingArtwork.image || "/placeholder.svg"}
                                          alt={editingArtwork.title}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="flex-1 space-y-4">
                                        <div>
                                          <Label htmlFor="title" className="text-[#8A5A3B]">
                                            Title
                                          </Label>
                                          <Input
                                            id="title"
                                            value={editingArtwork.title}
                                            onChange={(e) =>
                                              setEditingArtwork({ ...editingArtwork, title: e.target.value })
                                            }
                                            className="border-[#E8D7C9] rounded-none focus:border-[#C8977F] focus:ring-[#C8977F]"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="price" className="text-[#8A5A3B]">
                                            Price ($)
                                          </Label>
                                          <Input
                                            id="price"
                                            type="number"
                                            value={editingArtwork.price}
                                            onChange={(e) =>
                                              setEditingArtwork({
                                                ...editingArtwork,
                                                price: Number.parseInt(e.target.value),
                                              })
                                            }
                                            className="border-[#E8D7C9] rounded-none focus:border-[#C8977F] focus:ring-[#C8977F]"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="description" className="text-[#8A5A3B]">
                                        Description
                                      </Label>
                                      <Textarea
                                        id="description"
                                        value={editingArtwork.description}
                                        onChange={(e) =>
                                          setEditingArtwork({ ...editingArtwork, description: e.target.value })
                                        }
                                        className="border-[#E8D7C9] rounded-none focus:border-[#C8977F] focus:ring-[#C8977F]"
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                                                       <DialogClose>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingArtwork(null)}
                                          className="border-[#C8977F] text-[#C8977F] hover:bg-[#C8977F]/10 rounded-none"
                                        >
                                          Cancel
                                        </Button>
                                      </DialogClose>
                                      <DialogClose>
                                                                            <Button
                                        onClick={handleSaveArtwork}
                                        className="bg-[#C8977F] hover:bg-[#B78370] text-white border-none rounded-none"
                                      >
                                        Save Changes
                                      </Button>
                                    </DialogClose>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredArtworks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#A67C52]">No artworks found matching your search criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
