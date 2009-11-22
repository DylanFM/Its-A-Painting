class Painting
  include DataMapper::Resource

  property :id,       Serial
  property :name,     String, :nullable => false

  has n, :actions

  def history
    "[#{self.actions.collect { |action| action.steps }.join(",")}]"
  end

end
